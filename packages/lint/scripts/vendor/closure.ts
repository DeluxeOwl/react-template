import ts from "typescript"
import path from "node:path"
import enhancedResolve from "enhanced-resolve"
import {
    statSync, existsSync, readFileSync, realpathSync,
} from "node:fs"

import { fail } from "./fail.ts"

// How the family packages of a "packages" layout import each other (ESM, like oxlint loads them).
const resolveImport = enhancedResolve.create.sync({
    conditionNames: ["import", "node", "default"],
    extensions:     [".js", ".mjs", ".cjs", ".json"],
})

export interface Closure {
    // every upstream file to copy
    files:         Set<string>
    // "packages" layout: importing file → (specifier → resolved file) for imports within the family
    familyImports: Map<string, Map<string, string>>
}

// Module specifiers of imports/re-exports (also multi-line ones), dynamic imports and require()s,
// found by TypeScript's import scanner; plus esbuild's `__require("x")`.
export function specifiers(file: string): string[] {
    const source = readFileSync(file, "utf8")
    const scanned = ts.preProcessFile(source, true, true).importedFiles.map((reference) => reference.fileName)
    const bundled = [...source.matchAll(/\b__require\(\s*["'](?<name>[^"']+)["']\s*\)/gu)].map((match) => match.groups?.name ?? "")

    return [...scanned, ...bundled]
}

// CommonJS requires may leave out the extension (`require("./utils/ast-utils")`): resolve like Node.
function resolveLocal(file: string): string {
    const candidates = [file, `${file}.js`, `${file}.cjs`, `${file}.json`, path.join(file, "index.js")]

    return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? file
}

export function localImports(file: string): string[] {
    return specifiers(file).filter((specifier) => specifier.startsWith("."))
        .map((specifier) => resolveLocal(path.resolve(path.dirname(file), specifier)))
}

export function bareImports(file: string): string[] {
    return specifiers(file).filter((specifier) => !specifier.startsWith(".") && !specifier.startsWith("node:"))
}

export function packageName(specifier: string): string {
    const [scopeOrName = "", name = ""] = specifier.split("/")

    return scopeOrName.startsWith("@") ? `${scopeOrName}/${name}` : scopeOrName
}

function familyResolutions(file: string, family: (name: string) => boolean): Map<string, string> {
    const resolutions = new Map<string, string>()
    for (const specifier of bareImports(file).filter((name) => family(packageName(name)))) {
        const resolved = resolveImport(path.dirname(file), specifier)
        resolutions.set(specifier, realpathSync(resolved === false ? fail(`cannot resolve ${specifier} from ${file}`) : resolved))
    }

    return resolutions
}

// The files reachable from `roots` by relative imports (and, with `family`, by imports of the
// family's packages), in the order the old tool found them: the README lists packages in it.
export function collectClosure(roots: string[], family?: (name: string) => boolean): Closure {
    const closure: Closure = { familyImports: new Map(), files: new Set() }
    const queue = [...roots]
    for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
        if (closure.files.has(file)) {
            continue
        }
        closure.files.add(existsSync(file) ? file : fail(`missing ${file}`))
        queue.push(...localImports(file))
        const resolutions = family === undefined ? new Map<string, string>() : familyResolutions(file, family)
        if (resolutions.size > 0) {
            closure.familyImports.set(file, resolutions)
        }
        queue.push(...resolutions.values())
    }

    return closure
}

export function commonDir(files: string[]): string {
    let dir = path.dirname(files[0] ?? "/")
    while (!files.every((file) => file.startsWith(dir + path.sep))) {
        dir = path.dirname(dir)
    }

    return dir
}
