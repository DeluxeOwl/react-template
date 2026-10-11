/**
 * Finds duplicate function names across the codebase.
 *
 * This script:
 * 1. Lists the TypeScript files (.ts, .mts, .cts, .tsx) in the given directories that git doesn't
 *    ignore, skipping dot directories
 * 2. Parses them with TypeScript and collects the named functions: function declarations with a
 *    body, and arrow functions assigned to a variable
 * 3. Reports any duplicate function names with their file locations
 *
 * This used to run ast-grep patterns, which skipped every function with a return type or type
 * parameters (docs/oxlint-migration.md, Phase 9).
 *
 * Run: bun scripts/cli find-duplicate-functions [dirs...]
 * Example: bun scripts/cli find-duplicate-functions apps/ packages/
 */

import ts from "typescript"
import path from "node:path"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { spawnSync } from "node:child_process"

interface FunctionInfo {
    file:    string
    line:    number
    name:    string
    preview: string
}

const SourceExtensions = new Set([".ts", ".cts", ".mts", ".tsx"])
const PreviewLines = 3
const MaxListingBytes = 64_000_000

function isSourceFile(file: string): boolean {
    const isHidden = file.split("/").some((part) => part.startsWith("."))

    return SourceExtensions.has(path.extname(file)) && !isHidden
}

/** The files under `dir` that git tracks or would track, so .gitignore applies. */
function listSourceFiles(dir: string): string[] {
    const args = ["-C", dir, "ls-files", "--cached", "--others", "--exclude-standard"]
    const result = spawnSync("git", args, { encoding: "utf8", maxBuffer: MaxListingBytes })

    if (result.status !== 0) {
        console.error(`git ls-files failed in ${dir}:`, result.stderr)
        return []
    }

    return result.stdout.split("\n")
        .filter((file) => isSourceFile(file))
        .map((file) => path.join(dir, file))
        .filter((file) => existsSync(file))
}

/** `function name() {}`, or `const name = () => …` (any declarator, `let` and `var` too). */
function getFunctionName(node: ts.Node): ts.Identifier | undefined {
    if (ts.isFunctionDeclaration(node) && node.body !== undefined) {
        return node.name
    }
    const isArrowVariable = ts.isVariableDeclaration(node) && node.initializer !== undefined && ts.isArrowFunction(node.initializer)

    return isArrowVariable && ts.isIdentifier(node.name) ? node.name : undefined
}

export function collectFunctions(file: string, text: string): FunctionInfo[] {
    const scriptKind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind)
    const lines = text.split("\n")
    const functions: FunctionInfo[] = []
    const visit = (node: ts.Node): void => {
        const name = getFunctionName(node)

        if (name !== undefined) {
            const { line } = source.getLineAndCharacterOfPosition(name.getStart(source))
            const preview = lines
                .slice(line, line + PreviewLines)
                .map((previewLine) => `      ${previewLine}`)
                .join("\n")

            functions.push({
                file, line: line + 1, name: name.text, preview,
            })
        }
        ts.forEachChild(node, visit)
    }

    visit(source)
    return functions
}

export async function findAllFunctions(dirs: readonly string[]): Promise<FunctionInfo[]> {
    const files = new Set<string>()

    for (const dir of dirs) {
        for (const file of listSourceFiles(dir)) {
            files.add(file)
        }
    }

    const functions: FunctionInfo[] = []

    for (const file of files) {
        functions.push(...collectFunctions(file, await readFile(file, "utf8")))
    }
    return functions
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

