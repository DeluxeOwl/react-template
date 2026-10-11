import path from "node:path"
import { tmpdir } from "node:os"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import { execFileSync } from "node:child_process"
import {
    mkdirSync, existsSync, realpathSync, writeFileSync,
} from "node:fs"

import type { PluginSpec } from "./spec.ts"

import { fail } from "./fail.ts"
import { readManifest } from "./manifest.ts"

// Like the repo's .npmrc (`min-release-age=7`): don't install anything published in the last week.
const MinimumReleaseAgeDays = 7
const JsonIndent = 4

// Upstream plugins take TypeScript as a peer, and bun would install the newest one (which they may
// not support): install the TypeScript the repo runs, unless the spec pins one.
function repoTypeScript(): string {
    const manifestFile = createRequire(import.meta.url).resolve("typescript/package.json")

    return readManifest(path.dirname(manifestFile)).version ?? fail("cannot read the repo's TypeScript version")
}

// Installs the spec's pinned packages into a cache directory outside the repo (hoisted, so every
// package sits at node_modules/<name>) and returns it. The cache is reused while the pins are the same.
export function installUpstream(spec: PluginSpec): string {
    const dependencies = { typescript: repoTypeScript(), ...spec.install }
    const pins = JSON.stringify(dependencies)
    const hash = createHash("sha256").update(pins)
        .digest("hex")
        .slice(0, 12)
    const dir = path.join(tmpdir(), "deluxeowl-lint-vendor", `${spec.dir}-${hash}`)
    const marker = path.join(dir, ".installed")
    if (!existsSync(marker)) {
        mkdirSync(dir, { recursive: true })
        writeFileSync(path.join(dir, "package.json"), `${JSON.stringify({ dependencies, private: true }, undefined, JsonIndent)}\n`)
        const age = `--minimum-release-age=${MinimumReleaseAgeDays * 24 * 60 * 60}`
        execFileSync("bun", ["install", "--linker", "hoisted", age], { cwd: dir, stdio: "inherit" })
        writeFileSync(marker, pins)
    }

    return realpathSync(dir)
}
