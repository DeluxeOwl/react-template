#!/usr/bin/env bun
/**
 * Finds duplicate function names across the codebase using ast-grep.
 *
 * This script:
 * 1. Runs ast-grep to find all named functions (function declarations & arrow functions)
 * 2. Parses the JSON output to extract function names and locations
 * 3. Reports any duplicate function names with their file locations
 *
 * Run: bun scripts/find-duplicate-functions.ts [dirs...]
 * Example: bun scripts/find-duplicate-functions.ts apps/ packages/
 */

import { $ } from "bun"
import { parseArgs } from "node:util"

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
    metaVariables?: {
        single?: {
            NAME?: { text: string }
        }
    }
    range: {
        end:   { column: number, line: number }
        start: { column: number, line: number }
    }
    text: string
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
    const funcMatch = text.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/)
    if (funcMatch) {
        return funcMatch[1]
    }

    // Arrow function: const foo = (...) =>
    const arrowMatch = text.match(
        /^(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/,
    )
    if (arrowMatch) {
        return arrowMatch[1]
    }

    return null
}

function extractFunctionName(match: AstGrepMatch): null | string {
    return extractFromMetavariable(match) ?? extractFromText(match.text)
}

const PREVIEW_LINES = 3

function getPreview(text: string): string {
    const lines = text.split("\n").slice(0, PREVIEW_LINES)
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

async function runAstGrep(pattern: string, lang: string, dirs: string[]): Promise<FunctionInfo[]> {
    const args = ["run", "--pattern", pattern, "--lang", lang, "--json", ...dirs]
    const result = await $`ast-grep ${args}`.quiet().nothrow()

    if (result.exitCode !== 0 && result.stderr.toString().trim()) {
        console.error(`ast-grep failed for pattern "${pattern}":`, result.stderr.toString())
        return []
    }

    return parseAstGrepOutput(result.stdout.toString())
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

async function findAllFunctions(dirs: string[]): Promise<FunctionInfo[]> {
    const allFunctions: FunctionInfo[] = []
    const seen = new Set<string>()

    for (const lang of ["ts", "tsx"]) {
        for (const pattern of PATTERNS) {
            const functions = await runAstGrep(pattern, lang, dirs)
            allFunctions.push(...dedupeByLocation(functions, seen))
        }
    }

    return allFunctions
}

const IGNORED_NAMES = new Set([
    "App",
    "default",
    "index",
    "main",
])

function findDuplicates(functions: FunctionInfo[]): Map<string, FunctionInfo[]> {
    const byName = new Map<string, FunctionInfo[]>()

    for (const fn of functions) {
        if (IGNORED_NAMES.has(fn.name)) {
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

function printDuplicates(duplicates: Map<string, FunctionInfo[]>): void {
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

function parseCliArgs(): string[] {
    const { positionals } = parseArgs({
        allowPositionals: true,
        args:             Bun.argv.slice(2),
    })
    return positionals.length > 0 ? positionals : ["."]
}

function reportResults(functions: FunctionInfo[], duplicates: Map<string, FunctionInfo[]>): void {
    console.log(`Found ${functions.length} named functions\n`)

    if (duplicates.size === 0) {
        console.log("No duplicate function names found!")
        process.exit(0)
    }

    console.log(`Found ${duplicates.size} duplicate function name(s):\n`)
    printDuplicates(duplicates)
    process.exit(1)
}

async function main() {
    const dirs = parseCliArgs()
    console.log(`Searching for duplicate function names in: ${dirs.join(", ")}\n`)

    const functions = await findAllFunctions(dirs)
    const duplicates = findDuplicates(functions)
    reportResults(functions, duplicates)
}

await main()
