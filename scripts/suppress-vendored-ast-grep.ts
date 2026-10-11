// Run from the repository root with the vendored directories as arguments.
// Unlike .ignore files, these directives also suppress diagnostics in the editor.
import * as z from "zod"
import path from "node:path"
import { existsSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { addAstGrepSuppressions, type AstGrepSuppression } from "@deluxeowl/lint/ast-grep"

const scanBinary = path.resolve("node_modules/.bin/ast-grep")
const maxScanOutputBytes = 32_000_000
const cliArgumentOffset = 2
const positionSchema = z.object({ line: z.int().nonnegative() })
const findingsSchema = z.array(z.object({
    file:   z.string(),
    range:  z.object({ start: positionSchema }),
    ruleId: z.string().min(1),
}))

type Finding = z.infer<typeof findingsSchema>[number]

function parseFindings(output: string): Finding[] {
    try {
        const parsed: unknown = JSON.parse(output)
        const result = findingsSchema.safeParse(parsed)

        if (!result.success) {
            console.error("ast-grep returned invalid findings. No files were changed.")
            process.exit(1)
        }

        return result.data
    } catch {
        console.error("ast-grep did not return valid JSON. No files were changed.")
        return process.exit(1)
    }
}

function scan(targets: string[]): Finding[] {
    const directories = targets.filter((target) => existsSync(target))

    if (directories.length === 0) {
        return []
    }

    const result = spawnSync(scanBinary, ["scan", "--no-ignore", "dot", "--json=compact", ...directories], {
        encoding:  "utf8",
        maxBuffer: maxScanOutputBytes,
    })

    // Exit 1 means a successful scan found error-level diagnostics.
    if (result.error) {
        console.error(result.error.message)
        process.exit(1)
    }
    if (result.status !== 0 && result.status !== 1) {
        console.error(result.stderr)
        process.exit(1)
    }

    const findings = parseFindings(result.stdout)

    if (result.status === 1 && findings.length === 0) {
        console.error(result.stderr === "" ? "ast-grep failed without reporting findings." : result.stderr)
        process.exit(1)
    }

    return findings
}

function isInTargets(file: string, targets: string[]): boolean {
    const resolved = path.resolve(file)

    return targets.some((target) => resolved.startsWith(`${target}${path.sep}`))
}

function groupByFile(findings: Finding[]): Map<string, AstGrepSuppression[]> {
    const files = new Map<string, AstGrepSuppression[]>()

    for (const {
        file, range, ruleId,
    } of findings) {
        const sites = files.get(file) ?? []

        sites.push({ line: range.start.line, ruleId })
        files.set(file, sites)
    }

    return files
}

async function annotate(findings: Finding[]): Promise<void> {
    const changes: { file: string, source: string }[] = []

    for (const [file, sites] of groupByFile(findings)) {
        const source = addAstGrepSuppressions(await readFile(file, "utf8"), sites)

        if (Error.isError(source)) {
            console.error(`${file}: ${source.message}`)
            process.exit(1)
        }

        changes.push({ file, source })
    }

    // Validate every annotation before the first write to avoid partial updates on invalid input.
    for (const { file, source } of changes) {
        await writeFile(file, source)
    }

    console.log(`Suppressed ${findings.length} violation(s) in ${changes.length} file(s).`)
}

const args = process.argv.slice(cliArgumentOffset)
const isCheck = args.includes("--check")
const targets = args.filter((arg) => arg !== "--check").map((arg) => path.resolve(arg))

if (targets.length === 0 || targets.some((target) => target === process.cwd() || !isInTargets(target, [process.cwd()]))) {
    console.error("Specify vendored directories inside the repository, not the repository root.")
    process.exit(1)
}

const findings = scan(targets).filter((finding) => isInTargets(finding.file, targets))
const stale = findings.filter((finding) => finding.ruleId === "unused-suppression")
const actionable = findings.filter((finding) => finding.ruleId !== "unused-suppression")

for (const { file, range } of stale) {
    console.warn(`${file}:${range.start.line + 1}: remove the unused ast-grep-ignore directive.`)
}

if (isCheck && findings.length > 0) {
    console.error(`${findings.length} ast-grep violation(s) in the vendored directories.`)
    console.error("Run bun run lint:sg:suppress, then remove any unused directives.")
    process.exit(1)
}

if (actionable.length > 0) {
    await annotate(actionable)
} else {
    console.log("No unsuppressed ast-grep violations in the vendored directories.")
}

if (stale.length > 0) {
    process.exit(1)
}
