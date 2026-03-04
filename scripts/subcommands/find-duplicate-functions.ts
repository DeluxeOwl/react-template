/**
 * Finds duplicate function names across the codebase using ast-grep.
 *
 * This script:
 * 1. Runs ast-grep to find all named functions (function declarations & arrow functions)
 * 2. Parses the JSON output to extract function names and locations
 * 3. Reports any duplicate function names with their file locations
 *
 * Run: bun scripts/cli find-duplicate-functions [dirs...]
 * Example: bun scripts/cli find-duplicate-functions apps/ packages/
 */

import { $ } from "zx"

const PATTERNS = [
    // Function declarations
    "function $NAME($$$PARAMS) { $$$BODY }",
    // Arrow functions (sync)
    "const $NAME = ($$$PARAMS) => $BODY",
    "let $NAME = ($$$PARAMS) => $BODY",
    "var $NAME = ($$$PARAMS) => $BODY",
    // Arrow functions (async)
    "const $NAME = async ($$$PARAMS) => $BODY",
    "let $NAME = async ($$$PARAMS) => $BODY",
    "var $NAME = async ($$$PARAMS) => $BODY",
]

interface AstGrepMatch {
    file:           string
    text:           string
    metaVariables?: {
        single?: {
            NAME?: { text: string }
        }
    }
    range: {
        end:   { column: number, line: number }
        start: { column: number, line: number }
    }
}

interface FunctionInfo {
    file:    string
    line:    number
    name:    string
    preview: string
}

function extractFromMetavariable(match: AstGrepMatch): null | string {
    return match.metaVariables?.single?.NAME?.text ?? null
}

function extractFromText(text: string): null | string {
    // Function declaration: function foo(...
    const funcMatch = text.match(/^function\s+([$A-Z_a-z][\w$]*)\s*\(/)
    if (funcMatch) {
        return funcMatch[1]
    }

    // Arrow function: const foo = (...) =>
    const arrowMatch = text.match(
        /^(?:const|let|var)\s+([$A-Z_a-z][\w$]*)\s*=/,
    )
    if (arrowMatch) {
        return arrowMatch[1]
    }

    return null
}

function extractFunctionName(match: AstGrepMatch): null | string {
    return extractFromMetavariable(match) ?? extractFromText(match.text)
}

const PreviewLines = 3

function getPreview(text: string): string {
    const lines = text.split("\n").slice(0, PreviewLines)
    return lines.map((line) => `      ${line}`).join("\n")
}

function parseAstGrepOutput(stdout: string): FunctionInfo[] {
    if (!stdout.trim()) {
        return []
    }

    // @ts-expect-error Can't be bothered to add zod.
    const matches: AstGrepMatch[] = JSON.parse(stdout)
    const functions: FunctionInfo[] = []

    for (const match of matches) {
        const name = extractFunctionName(match)
        if (name) {
            functions.push({
                file:    match.file,
                // 0-indexed to 1-indexed
                line:    match.range.start.line + 1,
                name,
                preview: getPreview(match.text),
            })
        }
    }

    return functions
}

interface RunASTGrep {
    lang:    string
    pattern: string
    dirs:    readonly string[]
}

async function runAstGrep(params: Readonly<RunASTGrep>): Promise<FunctionInfo[]> {
    const { dirs, lang, pattern } = params
    const args = ["run", "--pattern", pattern, "--lang", lang, "--json", ...dirs]
    const result = await $`ast-grep ${args}`.quiet().nothrow()

    if (result.exitCode !== 0 && result.stderr.trim()) {
        console.error(`ast-grep failed for pattern "${pattern}":`, result.stderr)
        return []
    }

    return parseAstGrepOutput(result.stdout)
}

function dedupeByLocation(functions: FunctionInfo[], seen: Set<string>): FunctionInfo[] {
    return functions.filter((fn) => {
        const key = `${fn.file}:${fn.line}`
        if (seen.has(key)) {
            return false
        }
        seen.add(key)
        return true
    })
}

export async function findAllFunctions(dirs: readonly string[]): Promise<FunctionInfo[]> {
    const allFunctions: FunctionInfo[] = []
    const seen = new Set<string>()

    for (const lang of ["ts", "tsx"]) {
        for (const pattern of PATTERNS) {
            const functions = await runAstGrep({
                dirs, lang, pattern,
            })
            allFunctions.push(...dedupeByLocation(functions, seen))
        }
    }

    return allFunctions
}

const IgnoredNames = new Set([
    "App",
    "main",
    "index",
    "default",
])

export function findDuplicates(functions: FunctionInfo[]): Map<string, FunctionInfo[]> {
    const byName = new Map<string, FunctionInfo[]>()

    for (const fn of functions) {
        if (IgnoredNames.has(fn.name)) {
            continue
        }
        const existing = byName.get(fn.name) ?? []
        existing.push(fn)
        byName.set(fn.name, existing)
    }

    // Filter to only duplicates
    const duplicates = new Map<string, FunctionInfo[]>()
    for (const [name, fns] of byName) {
        if (fns.length > 1) {
            duplicates.set(name, fns)
        }
    }

    return duplicates
}

export function printDuplicates(duplicates: Map<string, FunctionInfo[]>): void {
    const sorted = [...duplicates.entries()].toSorted((a, b) => a[0].localeCompare(b[0]))

    for (const [name, locations] of sorted) {
        console.log(`  ${name}:`)
        const sortedLocs = locations.toSorted((a, b) => a.file.localeCompare(b.file))
        for (const loc of sortedLocs) {
            console.log(`    - ${loc.file}:${loc.line}`)
            console.log(loc.preview)
            console.log()
        }
    }
}

export function reportResults(functions: FunctionInfo[], duplicates: Map<string, FunctionInfo[]>): void {
    console.log(`Found ${functions.length} named functions\n`)

    if (duplicates.size === 0) {
        console.log("No duplicate function names found!")
        process.exit(0)
    }

    console.log(`Found ${duplicates.size} duplicate function name(s):\n`)
    printDuplicates(duplicates)
    process.exit(1)
}

