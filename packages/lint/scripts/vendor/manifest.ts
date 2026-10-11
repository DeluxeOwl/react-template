import path from "node:path"
import * as v from "valibot"
import {
    existsSync, readdirSync, readFileSync,
} from "node:fs"

import { fail } from "./fail.ts"

const Dependencies = v.record(v.string(), v.string())

const ManifestSchema = v.object({
    dependencies:     v.optional(Dependencies),
    license:          v.optional(v.string()),
    name:             v.optional(v.string()),
    peerDependencies: v.optional(Dependencies),
    type:             v.optional(v.string()),
    version:          v.optional(v.string()),
})

// The package.json fields the tool reads.
export type Manifest = v.InferOutput<typeof ManifestSchema>

export interface PackageRoot {
    dir:      string
    name:     string
    manifest: Manifest
}

export function readManifest(dir: string): Manifest {
    const text = readFileSync(path.join(dir, "package.json"), "utf8")

    return v.parse(ManifestSchema, JSON.parse(text))
}

// The installed package a file belongs to: its nearest package.json that has a name.
export function packageRoot(file: string): PackageRoot {
    let dir = path.dirname(file)
    while (dir !== path.dirname(dir)) {
        const manifest = existsSync(path.join(dir, "package.json")) ? readManifest(dir) : undefined
        if (manifest?.name !== undefined) {
            return {
                dir, manifest, name: manifest.name,
            }
        }
        dir = path.dirname(dir)
    }

    return fail(`no package.json above ${file}`)
}

interface Declaration {
    // that code, for the error message
    owner:    string
    // the packages some vendored code imports at runtime
    external: Set<string>
}

// Vendored code imports its runtime dependencies from wherever @deluxeowl/lint is installed, so
// each must be a dependency (or peer) of the package. knip ignores vendor/, so this checks it.
export function checkDeclared(lintDir: string, { external, owner }: Declaration): void {
    const manifest = readManifest(lintDir)
    const declared = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})])
    const missing = [...external].filter((name) => !declared.has(name))
    if (missing.length > 0) {
        fail(`${owner} imports ${missing.join(", ")}: add it to the dependencies in packages/lint/package.json`)
    }
}

// The LICENSE file of a package directory, if it has one.
export function licenseFile(dir: string): string | undefined {
    const name = readdirNames(dir).find((entry) => /^licen[cs]e(?:\.(?:md|txt))?$/iu.test(entry))

    return name === undefined ? undefined : path.join(dir, name)
}

function readdirNames(dir: string): string[] {
    return existsSync(dir) ? readdirSync(dir) : []
}
