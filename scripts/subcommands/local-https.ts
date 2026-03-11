/**
 * Local HTTPS reverse proxy with mDNS advertisement.
 *
 * This script:
 * 1. Parses service definitions (domain:host:port or domain:port)
 * 2. Generates a Caddyfile for HTTPS reverse proxying
 * 3. Starts Caddy and dns-sd processes
 * 4. Handles graceful shutdown on SIGINT/SIGTERM
 *
 * Run: bun scripts/cli local-https --services "frontend.local:5173,api.local:3041" --ip 192.168.1.100
 */

import * as z from "zod"
import path from "node:path"
import { Result } from "@praha/byethrow"
import { writeFile } from "node:fs/promises"
import { ErrorFactory } from "@praha/error-factory"
import { tmpdir, networkInterfaces } from "node:os"
import { spawn, type ChildProcess } from "node:child_process"
import {
    openSync, closeSync, unlinkSync, mkdtempSync,
} from "node:fs"

const DnsSDBinary = "dns-sd"
const CaddyBinary = "caddy"
const DefaultHost = "127.0.0.1"
const ShutdownTimeoutMs = 10_000
const SigtermGracePeriodMs = 3000

const ServicePartCountShort = 2
const ServicePartCountFull = 3

export class InvalidIPError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ ip: string }>(),
    message: "invalid IP address",
    name:    "InvalidIPError",
}) {}

export class ServiceParseError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ input: string, reason: string }>(),
    message: "failed to parse service definition",
    name:    "ServiceParseError",
}) {}

export class ProcessStartError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ binary: string, reason: string }>(),
    message: "failed to start process",
    name:    "ProcessStartError",
}) {}

interface Service {
    domain: string
    host:   string
    port:   number
}

const IPSchema = z.ipv4()

function parseIP(ip: string): Result.Result<string, InvalidIPError> {
    const parsed: z.ZodSafeParseResult<string> = IPSchema.safeParse(ip)

    if (!parsed.success) {
        return Result.fail(new InvalidIPError({ ip }))
    }

    return Result.succeed(parsed.data)
}

function parsePort(portStr: string, input: string): Result.Result<number, ServiceParseError> {
    const port = Number(portStr)

    if (Number.isNaN(port) || port <= 0) {
        return Result.fail(new ServiceParseError({
            input,
            reason: `invalid port: ${portStr}`,
        }))
    }

    return Result.succeed(port)
}

function parseSingleService(input: string): Result.Result<Service, ServiceParseError> {
    const parts = input.split(":")

    if (parts.length === ServicePartCountShort) {
        const [domain, portStr] = parts
        const portResult = parsePort(portStr, input)

        if (Result.isFailure(portResult)) {
            return portResult
        }

        return Result.succeed({
            domain, host: DefaultHost, port: portResult.value,
        })
    }

    if (parts.length === ServicePartCountFull) {
        const [
            domain,
            host,
            portStr,
        ] = parts
        const portResult = parsePort(portStr, input)

        if (Result.isFailure(portResult)) {
            return portResult
        }

        return Result.succeed({
            domain, host, port: portResult.value,
        })
    }

    return Result.fail(new ServiceParseError({
        input,
        reason: "expected format domain:port or domain:host:port",
    }))
}

function parseServices(raw: string): Result.Result<Service[], ServiceParseError> {
    const entries = raw.split(",").map((s) => s.trim())
        .filter(Boolean)
    const services: Service[] = []

    for (const entry of entries) {
        const result = parseSingleService(entry)

        if (Result.isFailure(result)) {
            return result
        }

        services.push(result.value)
    }

    return Result.succeed(services)
}

function buildCaddyBlock(service: Service): string {
    return [
        `${service.domain} {`,
        "    bind 0.0.0.0",
        "    tls internal",
        `    reverse_proxy ${service.host}:${service.port}`,
        "}",
    ].join("\n")
}

function buildCaddyfile(services: readonly Service[]): string {
    return `${services.map((s) => buildCaddyBlock(s)).join("\n\n")}\n`
}

interface ManagedProcess {
    readonly logPath: string
    readonly name:    string
    readonly child:   ChildProcess
    stop:             () => Promise<void>
}

function createLogPath(label: string): string {
    return path.join(tmpdir(), `${label}-${process.pid}.log`)
}

function spawnManagedProcess(params: {
    args:     readonly string[]
    binary:   string
    logLabel: string
}): Result.Result<ManagedProcess, ProcessStartError> {
    const {
        args, binary, logLabel,
    } = params
    const logPath = createLogPath(logLabel)
    const logFd = openSync(logPath, "w")

    console.log(`Logs for ${binary} being written to: ${logPath}`)

    const child = spawn(binary, [...args], {
        detached: true,
        stdio:    ["ignore", logFd, logFd],
    })

    child.unref()

    let stopped = false

    async function stop(): Promise<void> {
        if (stopped) {
            return
        }

        stopped = true
        child.kill("SIGTERM")

        const exitedInTime = await Promise.race([
            new Promise<boolean>((resolve) => {
                child.on("exit", () => {
                    resolve(true)
                })
            }),
            new Promise<boolean>((resolve) => {
                setTimeout(() => {
                    resolve(false)
                }, SigtermGracePeriodMs)
            }),
        ])

        if (!exitedInTime) {
            child.kill("SIGKILL")
            await new Promise<void>((resolve) => {
                child.on("exit", () => {
                    resolve()
                })
            })
        }

        closeSync(logFd)
    }

    return Result.succeed({
        child, logPath, name: binary, stop,
    })
}

async function startCaddy(caddyfile: string): Promise<Result.Result<ManagedProcess, ProcessStartError>> {
    const tmpDir = mkdtempSync(path.join(tmpdir(), "caddy-"))
    const tmpPath = path.join(tmpDir, "Caddyfile")
    await writeFile(tmpPath, caddyfile)

    const result = spawnManagedProcess({
        args:     ["run", "--config", tmpPath],
        binary:   CaddyBinary,
        logLabel: CaddyBinary,
    })

    if (Result.isFailure(result)) {
        safeUnlink(tmpPath)
        return result
    }

    // Clean up Caddyfile when process exits
    result.value.child.on("exit", () => {
        safeUnlink(tmpPath)
    })

    return result
}

function startDnsSd(params: {
    domain: string
    ip:     string
}): Result.Result<ManagedProcess, ProcessStartError> {
    const { domain, ip } = params
    const args = ["-P", domain, "_http._tcp", "local", "443", domain, ip]

    console.log(`Running: ${DnsSDBinary} ${args.join(" ")}`)

    return spawnManagedProcess({
        args,
        binary:   DnsSDBinary,
        logLabel: `${DnsSDBinary}-${domain}`,
    })
}

// ---------------------------------------------------------------------------
// Shutdown
// ---------------------------------------------------------------------------

async function shutdownAll(processes: readonly ManagedProcess[]): Promise<void> {
    const timeout = setTimeout(() => {
        console.error("Shutdown timed out")
        process.exit(1)
    }, ShutdownTimeoutMs)

    const results = await Promise.allSettled(
        processes.map((p) => p.stop()),
    )

    clearTimeout(timeout)

    const failures = results.filter((r) => r.status === "rejected")

    if (failures.length > 0) {
        console.error(`${failures.length} process(es) failed to stop cleanly`)
        process.exit(1)
    }

    console.log("All processes stopped successfully")
}

function waitForSignal(): Promise<void> {
    return new Promise((resolve) => {
        process.on("SIGINT", () => {
            resolve()
        })
        process.on("SIGTERM", () => {
            resolve()
        })
    })
}

function safeUnlink(filePath: string): void {
    try {
        unlinkSync(filePath)
    // oxlint-disable-next-line no-empty
    } catch {}
}

function detectLocalIP(): Result.Result<string, InvalidIPError> {
    const interfaces = networkInterfaces()

    for (const entries of Object.values(interfaces)) {
        if (!entries) {
            continue
        }

        for (const entry of entries) {
            if (entry.family === "IPv4" && !entry.internal) {
                return Result.succeed(entry.address)
            }
        }
    }

    return Result.fail(new InvalidIPError({ ip: "(auto-detect failed)" }))
}

// oxlint-disable-next-line max-statements
export async function parseAndRun(
    ipFlag: string | undefined,
    servicesFlag: string,
): Promise<void> {
    const ipResult = ipFlag ? parseIP(ipFlag) : detectLocalIP()

    if (Result.isFailure(ipResult)) {
        console.error(`Error: ${ipResult.error.message} — ${ipResult.error.ip}`)
        process.exit(1)
    }

    const ip = ipResult.value
    const servicesResult = parseServices(servicesFlag)

    if (Result.isFailure(servicesResult)) {
        console.error(`Error: ${servicesResult.error.message} — ${servicesResult.error.reason} (input: "${servicesResult.error.input}")`)
        process.exit(1)
    }

    const services = servicesResult.value
    logServiceTable(ip, services)

    const allProcesses = await startAllProcesses(ip, services)

    console.log("\nLocal HTTPS proxy running. Press Ctrl+C to stop.\n")

    await waitForSignal()

    console.log("\nShutting down...")
    await shutdownAll(allProcesses)
}

function logServiceTable(ip: string, services: readonly Service[]): void {
    console.log(`Advertising IP: ${ip}`)

    for (const svc of services) {
        console.log(`  ${svc.domain} -> ${svc.host}:${svc.port}  (https://${svc.domain})`)
    }
}

async function startAllProcesses(ip: string, services: readonly Service[]): Promise<ManagedProcess[]> {
    const caddyfile = buildCaddyfile(services)
    const caddyResult = await startCaddy(caddyfile)

    if (Result.isFailure(caddyResult)) {
        console.error(`Failed to start Caddy: ${caddyResult.error.reason}`)
        process.exit(1)
    }

    const allProcesses: ManagedProcess[] = [caddyResult.value]

    for (const svc of services) {
        const dnsResult = startDnsSd({ domain: svc.domain, ip })

        if (Result.isFailure(dnsResult)) {
            console.error(`Failed to start dns-sd for ${svc.domain}: ${dnsResult.error.reason}`)
            continue
        }

        allProcesses.push(dnsResult.value)
    }

    return allProcesses
}
