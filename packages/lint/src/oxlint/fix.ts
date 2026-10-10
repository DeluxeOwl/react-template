// `oxlint --fix`, repeated until the files stop changing: what `eslint --fix` does in one run.
//
// oxlint applies one round of fixes per run. ESLint lints and fixes again, up to 10 passes per file,
// so fixes that depend on each other (a line break, then the indentation and key alignment of the
// new line) all land in one `eslint --fix`. Changes are detected through `git ls-files` (tracked and
// untracked, not ignored) under the current directory; outside a git work tree all rounds run.
import path from "node:path"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import { statSync, readFileSync } from "node:fs"
import { spawnSync, type SpawnSyncReturns } from "node:child_process"

// ESLint's MAX_AUTOFIX_PASSES
const maxRounds = 10
// Files oxlint lints (JS/TS, and the script blocks of Vue/Svelte/Astro files)
const lintable = /\.(?:[cm]?[jt]sx?|vue|svelte|astro)$/u

function isFile(file: string): boolean {
    return statSync(file, { throwIfNoEntry: false })?.isFile() ?? false
}

function snapshot(cwd: string): string | undefined {
    const listed = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd, encoding: "utf8" })

    if (listed.status !== 0) {
        return undefined
    }

    const files = listed.stdout.split("\0").map((name) => path.join(cwd, name))
    const hash = createHash("sha1")

    for (const file of files.filter((name) => lintable.test(name) && isFile(name))) {
        hash.update(file)
        hash.update(readFileSync(file))
    }

    return hash.digest("hex")
}

function oxlint(args: string[], cwd: string): SpawnSyncReturns<string> {
    const oxlintPackage = createRequire(import.meta.url).resolve("oxlint/package.json")

    return spawnSync(path.join(path.dirname(oxlintPackage), "bin/oxlint"), args, { cwd, encoding: "utf8" })
}

function report(result: SpawnSyncReturns<string>): number {
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)

    return result.status ?? 1
}

/**
 * Run `oxlint --fix <args>` up to 10 times, until a round changes no file, then print that
 * round's report and return its exit status. If the 10th round still changed files, lint once
 * more without fixing (as ESLint does) and report that.
 */
export function runOxlintFix(args: string[], options?: { cwd?: string }): number {
    const cwd = options?.cwd ?? process.cwd()
    let before = snapshot(cwd)

    for (let round = 1; round <= maxRounds; round++) {
        const result = oxlint(["--fix", ...args], cwd)
        const after = snapshot(cwd)

        if ((after !== undefined && after === before) || result.status === null) {
            return report(result)
        }
        before = after
    }

    return report(oxlint(args, cwd))
}
