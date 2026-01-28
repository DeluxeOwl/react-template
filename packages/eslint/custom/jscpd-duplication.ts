/**
 * ESLint rule: no-code-duplication
 *
 * Reports code duplication detected by jscpd as ESLint warnings.
 * This enables IDE integration (Problems panel, inline squiggles, etc.)
 * Taken from here: https://github.com/shepherdjerred/scout-for-lol/tree/main/eslint-rules
 * It also has a knip rule but I don't want to use that.
 *
 * The rule runs jscpd once per lint session and caches results for efficiency.
 */

import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import { spawnSync } from "node:child_process"
import { ESLintUtils } from "@typescript-eslint/utils"
import { rmSync, statSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"

const DefaultMinLines = 5
/**
 * Default cache TTL: 1 minute
 * This allows re-running ESLint without re-running expensive tools,
 * while ensuring results don't get too stale.
 */
const CACHE_TTL_MS = 1000
const jscpdCache = new Map<string, CacheEntry<JscpdResults>>()

interface CacheEntry<T> {
    results:   T
    timestamp: number
}

/**
 * Typed caches for each tool
 * Using separate caches avoids the need for type assertions
 */

interface GetOrComputeJscpdParams {
    projectRoot: string
    ttlMs?:      number
    computeFn:   () => JscpdResults
}

/**
 * Get or compute jscpd results
 */
function getOrComputeJscpd(
    { computeFn, projectRoot, ttlMs = CACHE_TTL_MS }: GetOrComputeJscpdParams,
): JscpdResults {
    const repoRoot = findRepoRoot(projectRoot)
    const key = `${repoRoot}:jscpd`
    const cached = jscpdCache.get(key)

    if (cached && Date.now() - cached.timestamp < ttlMs) {
        return cached.results
    }

    const results = computeFn()
    jscpdCache.set(key, { results, timestamp: Date.now() })
    return results
}

const LOCK_TTL_MS = 120_000 // 2 minute lock safety timeout

/**
 * Finds the monorepo root by looking for package.json
 */
function findRepoRoot(startDir: string): string {
    let current = startDir
    while (current !== dirname(current)) {
        if (existsSync(resolve(current, "package.json"))) {
            // Check if it's the monorepo root (has workspaces or jscpd config)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const pkg = JSON.parse(readFileSync(resolve(current, "package.json"), "utf8")) as { workspaces?: unknown }
            if (pkg.workspaces || existsSync(resolve(current, ".jscpd.json"))) {
                return current
            }
        }
        current = dirname(current)
    }
    return startDir
}

/**
 * Sleeps for N milliseconds
 */
function sleep(ms: number): void {
    const start = Date.now()

    // oxlint-disable-next-line no-empty, no-lone-blocks
    while (Date.now() - start < ms) {}
}

/**
 * Prevents parallel execution of expensive tools.
 * If locked, waits for the lock to be released (up to 30s) or for it to expire.
 */
// oxlint-disable-next-line max-statements
function withLock<T>(lockPath: string, fn: () => T): T {
    const waitStart = Date.now()
    const WAIT_TIMEOUT = 30_000

    while (existsSync(lockPath)) {
        try {
            const stats = statSync(lockPath)
            // If lock is old, assume it's stale and break out to take it
            if (Date.now() - stats.mtimeMs > LOCK_TTL_MS) {
                break
            }

            // If we've waited too long, skip this run
            if (Date.now() - waitStart > WAIT_TIMEOUT) {
                console.warn(`[tool-runner] Timeout waiting for lock: ${lockPath}`)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                return undefined as unknown as T
            }

            // Wait a bit before polling again
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            sleep(500)
        } catch {
            // Lock might have been deleted between existsSync and statSync
            break
        }
    }

    try {
        writeFileSync(lockPath, String(process.pid))
        return fn()
    } finally {
        try {
            // Only remove if it's ours (simple check)
            if (existsSync(lockPath) && readFileSync(lockPath, "utf8") === String(process.pid)) {
                rmSync(lockPath, { force: true })
            }
        } catch { /* ignore */ }
    }
}

interface JscpdLocation {
    end:      number
    name:     string
    start:    number
    endLoc:   { column: number, line: number }
    startLoc: { column: number, line: number }
}

interface JscpdDuplicate {
    format:     string
    lines:      number
    tokens:     number
    firstFile:  JscpdLocation
    secondFile: JscpdLocation
}

interface JscpdOutput {
    statistics: unknown
    duplicates: JscpdDuplicate[]
}

interface DuplicationInfo {
    endCol:         number
    endLine:        number
    lines:          number
    otherEndLine:   number
    otherFile:      string
    otherStartLine: number
    startCol:       number
    startLine:      number
}

type JscpdResults = Map<string, DuplicationInfo[]>

// oxlint-disable-next-line max-statements
function runJscpd(startDir: string): JscpdResults {
    const repoRoot = findRepoRoot(startDir)
    const results: JscpdResults = new Map()
    const lockPath = resolve(repoRoot, "node_modules/.jscpd.lock")
    let tempDir: string | undefined

    try {
        const output = withLock(lockPath, () => {
            tempDir = mkdtempSync(resolve(tmpdir(), "jscpd-"))
            const configPath = resolve(repoRoot, ".jscpd.json")

            const result = spawnSync("bun", ["run", "jscpd", "-c", configPath, "--reporters", "json", "--output", tempDir, "."], {
                cwd:      repoRoot,
                encoding: "utf8",
                shell:    false,
                timeout:  180_000,
            })

            if (result.error) {
                return null
            }

            const reportPath = resolve(tempDir, "jscpd-report.json")
            if (!existsSync(reportPath)) {
                return null
            }

            return readFileSync(reportPath, "utf8")
        })

        if (!output) {
            return results
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const parsed = JSON.parse(output) as JscpdOutput

        for (const dup of parsed.duplicates) {
            const firstPath = resolve(repoRoot, dup.firstFile.name)
            const secondPath = resolve(repoRoot, dup.secondFile.name)

            const firstInfo: DuplicationInfo = {
                endCol:         dup.firstFile.endLoc.column,
                endLine:        dup.firstFile.endLoc.line,
                lines:          dup.lines,
                otherEndLine:   dup.secondFile.endLoc.line,
                otherFile:      dup.secondFile.name,
                otherStartLine: dup.secondFile.startLoc.line,
                startCol:       dup.firstFile.startLoc.column,
                startLine:      dup.firstFile.startLoc.line,
            }

            const secondInfo: DuplicationInfo = {
                endCol:         dup.secondFile.endLoc.column,
                endLine:        dup.secondFile.endLoc.line,
                lines:          dup.lines,
                otherEndLine:   dup.firstFile.endLoc.line,
                otherFile:      dup.firstFile.name,
                otherStartLine: dup.firstFile.startLoc.line,
                startCol:       dup.secondFile.startLoc.column,
                startLine:      dup.secondFile.startLoc.line,
            }

            if (!results.has(firstPath)) {
                results.set(firstPath, [])
            }
            results.get(firstPath)?.push(firstInfo)

            if (!results.has(secondPath)) {
                results.set(secondPath, [])
            }
            results.get(secondPath)?.push(secondInfo)
        }
    } catch (error) {
        console.error("[no-code-duplication] Error:", error)
    } finally {
        if (tempDir) {
            try {
                rmSync(tempDir, { force: true, recursive: true })
            } catch { /* ignore */ }
        }
    }

    return results
}

const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/shepherdjerred/homelab/blob/main/eslint-rules/${name}.ts`,
)

type MessageIds = "codeDuplication"

type Options = [
    {
        minLines?: number
    },
]

/**
 * ESLint rule to report jscpd duplication findings
 */
export const noCodeDuplication = createRule<Options, MessageIds>({
    create(context, [options]) {
        const filename = context.filename
        const projectRoot = context.cwd
        const minLines = options.minLines ?? DefaultMinLines

        // Always analyze from the repo root to ensure consistent results and caching
        const repoRoot = findRepoRoot(projectRoot)

        // Get or compute jscpd results (cached per project)
        const jscpdResults = getOrComputeJscpd({
            computeFn:   () => runJscpd(repoRoot),
            projectRoot: repoRoot,
        })

        // Check if this file has any duplications
        const fileDuplications = jscpdResults.get(filename)
        if (!fileDuplications || fileDuplications.length === 0) {
            return {}
        }

        // Track reported locations to avoid duplicates
        const reportedLocations = new Set<string>()

        return {
            Program(node) {
                for (const dup of fileDuplications) {
                    // Skip if below minimum lines threshold
                    if (dup.lines < minLines) {
                        continue
                    }

                    // Create a unique key for this duplication location
                    const locationKey = `${dup.startLine}:${dup.startCol}-${dup.endLine}:${dup.endCol}`
                    if (reportedLocations.has(locationKey)) {
                        continue
                    }
                    reportedLocations.add(locationKey)

                    // Report at the start of the duplicated block
                    context.report({
                        data: {
                            lines:      String(dup.lines),
                            otherEnd:   String(dup.otherEndLine),
                            otherFile:  dup.otherFile,
                            otherStart: String(dup.otherStartLine),
                        },
                        loc: {
                            end:   { column: dup.endCol, line: dup.endLine },
                            start: { column: dup.startCol, line: dup.startLine },
                        },
                        messageId: "codeDuplication",
                        node,
                    })
                }
            },
        }
    },
    defaultOptions: [
        {
            minLines: 5,
        },
    ],
    meta: {
        docs: {
            description: "Report code duplication detected by jscpd",
        },
        messages: {
            codeDuplication:
        "Duplicated code block ({{lines}} lines) - also found in {{otherFile}}:{{otherStart}}-{{otherEnd}}",
        },
        schema: [
            {
                additionalProperties: false,
                properties:           {
                    minLines: {
                        default:     5,
                        description: "Minimum lines for a duplication to be reported",
                        type:        "number",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
    name: "no-code-duplication",
})
