import path from "node:path"
import { build, type Plugin } from "esbuild"
import {
    mkdirSync, existsSync, readFileSync, writeFileSync,
} from "node:fs"

import type { Upstream } from "../spec.ts"

import { fail } from "../fail.ts"
import { readManifest } from "../manifest.ts"

// For specs whose plugin is bundled before it is copied (layout kind "bundle").

// The module to bundle (esbuild's `stdin`).
interface BundleEntry {
    contents:   string
    resolveDir: string
    sourcefile: string
}

export interface BundleInput {
    plugin:   Plugin
    external: string[]
    entry:    BundleEntry
}

export interface Bundle {
    text:   string
    // the files esbuild read (absolute paths; virtual modules too)
    inputs: string[]
}

// The license file names of bundled packages, in the order they are looked for.
const licenseNames = ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENSE-MIT", "LICENSE.BSD", "license", "license.md"]

// esbuild hands plugin filters to Go's regexp engine as `(?flags)source`; Go has no `u` flag.
export function goRegExp(source: string): RegExp {
    // oxlint-disable-next-line eslint/require-unicode-regexp -- Go's regexp engine has no `u` flag
    return new RegExp(source)
}

// Bundles `entry` and what it imports, except `external`, into one Node ES module. Its `// path`
// comments are relative to the install directory (hoisted), so they are the same on every machine.
export async function bundle(upstream: Upstream, input: BundleInput): Promise<Bundle> {
    const result = await build({
        absWorkingDir: upstream.installDir,
        banner:        { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
        bundle:        true,
        external:      input.external,
        format:        "esm",
        legalComments: "eof",
        metafile:      true,
        outfile:       path.join(upstream.installDir, "bundle/plugin.mjs"),
        platform:      "node",
        plugins:       [input.plugin],
        stdin:         { ...input.entry, loader: "js" },
        target:        "node22",
        write:         false,
    })
    let text = result.outputFiles[0]?.text ?? fail("esbuild produced no output")
    for (const name of ["os", "tty", "util"]) {
        text = text.replaceAll(`__require("${name}")`, `__require("node:${name}")`)
    }

    return { inputs: Object.keys(result.metafile.inputs).map((file) => path.resolve(upstream.installDir, file)), text }
}

// The directory of the nearest package.json above `file` (also one without a name).
function manifestDir(file: string): string | undefined {
    let dir = path.dirname(file)
    while (dir !== path.dirname(dir) && !existsSync(path.join(dir, "package.json"))) {
        dir = path.dirname(dir)
    }

    return existsSync(path.join(dir, "package.json")) ? dir : undefined
}

// package@version → license text of every bundled package (plus `own`).
export function bundledLicenses(inputs: string[], own: Map<string, string>): Map<string, string> {
    const licenses = new Map(own)
    const unlicensed = new Set<string>()
    for (const dir of inputs.filter((input) => input.includes("/node_modules/")).map((input) => manifestDir(input))) {
        const manifest = dir === undefined ? undefined : readManifest(dir)
        const license = licenseNames.map((name) => path.join(dir ?? "", name)).find((file) => dir !== undefined && existsSync(file))
        const id = `${manifest?.name ?? "?"}@${manifest?.version ?? "?"}`
        if (license !== undefined) {
            licenses.set(id, readFileSync(license, "utf8"))
        } else if (manifest !== undefined) {
            unlicensed.add(id)
        }
    }
    if (unlicensed.size > 0) {
        fail(`bundled packages without a license: ${[...unlicensed].join(", ")}`)
    }

    return licenses
}

// The full license of every bundled package (plus `own`), as comments for the end of the bundle,
// so they survive copying the one file.
export function licenseNotices(inputs: string[], own: Map<string, string>): string {
    return [...bundledLicenses(inputs, own)].toSorted(([left], [right]) => left.localeCompare(right)).map(([id, text]) => `/*\nBundled dependency: ${id}\n${text.replaceAll("*/", "* /")}\n*/`)
        .join("\n")
}

// Writes the bundle into the install, where its external imports resolve, and returns its path.
export function writeBundle(upstream: Upstream, text: string): string {
    const file = path.join(upstream.installDir, "bundle/plugin.mjs")
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, text)

    return file
}
