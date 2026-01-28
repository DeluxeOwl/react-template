/**
 * Tool runner for knip and jscpd
 *
 * Executes project-wide analysis tools and parses their JSON output.
 *
 * Performance optimization: If cache files exist (.knip-cache.json, .jscpd-cache.json),
 * the runner will use those instead of running the tools. Generate these files by running:
 *   bunx knip --reporter json > .knip-cache.json
 *   bunx jscpd --reporters json --output .jscpd-cache . && mv .jscpd-cache/jscpd-report.json .jscpd-cache.json
 */

import { tmpdir } from "node:os"
import { resolve } from "node:path"
import { spawnSync } from "node:child_process"
import { rmSync, existsSync, mkdtempSync, readFileSync } from "node:fs"

// Cache file names (place in project root)
const KNIP_CACHE_FILE = ".knip-cache.json"
const JSCPD_CACHE_FILE = ".jscpd-cache.json"

// ============================================================================
// Knip Types and Runner
// ============================================================================

/**
 * Knip export entry from JSON reporter
 */
interface KnipExportEntry {
    col:  number
    line: number
    name: string
    pos:  number
}

/**
 * Knip issue from JSON reporter (per file)
 */
interface KnipIssue {
    file:                     string
    catalog:                  unknown[]
    dependencies:             unknown[]
    devDependencies:          unknown[]
    optionalPeerDependencies: unknown[]
    unresolved:               unknown[]
    exports:                  KnipExportEntry[]
}

/**
 * Knip JSON output structure
 */
interface KnipOutput {
    files:  string[]
    issues: KnipIssue[]
}

/**
 * Normalized knip result per file
 */
export interface KnipFileResult {
    isUnusedFile:  boolean
    unusedExports: {
        col?:   number
        line?:  number
        symbol: string
    }[]
}

/**
 * Map of file path to knip results
 */
export type KnipResults = Map<string, KnipFileResult>

/**
 * Try to read knip results from cache file
 */
function readKnipCache(projectRoot: string): null | string {
    const cachePath = resolve(projectRoot, KNIP_CACHE_FILE)
    if (existsSync(cachePath)) {
        try {
            return readFileSync(cachePath, "utf8")
        } catch {
            return null
        }
    }
    return null
}

/**
 * Run knip and parse results
 *
 * If .knip-cache.json exists, uses that instead of running knip (much faster).
 * Generate the cache with: bunx knip --reporter json > .knip-cache.json
 */
// oxlint-disable-next-line max-statements
export function runKnip(projectRoot: string): KnipResults {
    const results: KnipResults = new Map()

    try {
        // Try cache file first (instant)
        let output = readKnipCache(projectRoot)

        // Fall back to running knip (slow, ~3s)
        if (output === null) {
            const result = spawnSync("bunx", ["knip", "--reporter", "json"], {
                cwd:      projectRoot,
                encoding: "utf8",
                shell:    false,
                timeout:  120_000, // 2 minute timeout
            })

            if (result.error) {
                console.error("[knip-unused] Failed to run knip:", result.error.message)
                return results
            }

            output = result.stdout.trim()
        }

        if (!output) {
            return results
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const parsed = JSON.parse(output) as KnipOutput

        // Process unused files
        for (const file of parsed.files) {
            const absPath = resolve(projectRoot, file)
            results.set(absPath, {
                isUnusedFile:  true,
                unusedExports: [],
            })
        }

        // Process issues (unused exports, etc.)
        for (const issue of parsed.issues) {
            const absPath = resolve(projectRoot, issue.file)
            const existing = results.get(absPath)

            // Convert exports array to our format
            const unusedExports = issue.exports.map((exp) => ({
                col:    exp.col,
                line:   exp.line,
                symbol: exp.name,
            }))

            if (existing) {
                existing.unusedExports.push(...unusedExports)
            } else {
                results.set(absPath, {
                    isUnusedFile: false,
                    unusedExports,
                })
            }
        }
    } catch (error) {
        console.error("[knip-unused] Error parsing knip output:", Error.isError(error) ? error.message : String(error))
    }

    return results
}

// ============================================================================
// jscpd Types and Runner
// ============================================================================

/**
 * jscpd file location
 */
interface JscpdLocation {
    end:      number
    name:     string
    start:    number
    endLoc:   { column: number, line: number }
    startLoc: { column: number, line: number }
}

/**
 * jscpd duplicate entry
 */
interface JscpdDuplicate {
    format:     string
    lines:      number
    tokens:     number
    firstFile:  JscpdLocation
    secondFile: JscpdLocation
}

/**
 * jscpd JSON output structure
 */
interface JscpdOutput {
    statistics: unknown
    duplicates: JscpdDuplicate[]
}

/**
 * Normalized duplication info per file
 */
export interface DuplicationInfo {
    endCol:         number
    endLine:        number
    lines:          number
    otherEndLine:   number
    otherFile:      string
    otherStartLine: number
    startCol:       number
    startLine:      number
}

/**
 * Map of file path to list of duplications
 */
export type JscpdResults = Map<string, DuplicationInfo[]>

/**
 * Try to read jscpd results from cache file
 */
function readJscpdCache(projectRoot: string): null | string {
    const cachePath = resolve(projectRoot, JSCPD_CACHE_FILE)
    if (existsSync(cachePath)) {
        try {
            return readFileSync(cachePath, "utf8")
        } catch {
            return null
        }
    }
    return null
}

/**
 * Run jscpd and parse results
 *
 * If .jscpd-cache.json exists, uses that instead of running jscpd (MUCH faster).
 * Generate the cache with:
 *   bunx jscpd --reporters json --output /tmp/jscpd .
 *   cp /tmp/jscpd/jscpd-report.json .jscpd-cache.json
 */
// oxlint-disable-next-line max-statements
export function runJscpd(projectRoot: string): JscpdResults {
    const results: JscpdResults = new Map()
    let tempDir: string | undefined

    try {
        // Try cache file first (instant)
        const cachedOutput = readJscpdCache(projectRoot)

        let output: string

        if (cachedOutput !== null) {
            output = cachedOutput
        } else {
            // Fall back to running jscpd (very slow, ~2+ minutes)
            tempDir = mkdtempSync(resolve(tmpdir(), "jscpd-"))

            const result = spawnSync("bun", ["run", "jscpd", "--reporters", "json", "--output", tempDir, "."], {
                cwd:      projectRoot,
                encoding: "utf8",
                shell:    false,
                timeout:  180_000, // 3 minute timeout
            })

            if (result.error) {
                console.error("[no-code-duplication] Failed to run jscpd:", result.error.message)
                return results
            }

            // Read the JSON report
            const reportPath = resolve(tempDir, "jscpd-report.json")
            if (!existsSync(reportPath)) {
                return results
            }

            output = readFileSync(reportPath, "utf8")
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const parsed = JSON.parse(output) as JscpdOutput

        // Process duplicates
        for (const dup of parsed.duplicates) {
            // Add entry for first file
            const firstPath = resolve(projectRoot, dup.firstFile.name)
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

            const firstExisting = results.get(firstPath)
            if (firstExisting) {
                firstExisting.push(firstInfo)
            } else {
                results.set(firstPath, [firstInfo])
            }

            // Add entry for second file
            const secondPath = resolve(projectRoot, dup.secondFile.name)
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

            const secondExisting = results.get(secondPath)
            if (secondExisting) {
                secondExisting.push(secondInfo)
            } else {
                results.set(secondPath, [secondInfo])
            }
        }
    } catch (error) {
        console.error(
            "[no-code-duplication] Error parsing jscpd output:",
            Error.isError(error) ? error.message : String(error),
        )
    } finally {
        // Clean up temp directory
        if (tempDir) {
            try {
                rmSync(tempDir, { force: true, recursive: true })
            } catch (error) {
                console.error(
                    `[no-code-duplication] Error cleaning temp dir ${tempDir}:`,
                    Error.isError(error) ? error.message : String(error),
                )
            }
        }
    }

    return results
}
