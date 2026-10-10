// `oxlint --fix`, repeated until the files stop changing: what `eslint --fix` does in one run.
//
// oxlint applies one round of fixes per run. ESLint lints and fixes again, up to 10 passes per file,
// so fixes that depend on each other (a line break, then the indentation and key alignment of the
// new line) all land in one `eslint --fix`. ESLint also stops fixing a file whose text after a pass
// is the text it had two passes earlier: two rules undo each other's fixes ("Circular fixes
// detected"). Such a file keeps that text here too: later rounds' fixes to it are undone. Changes
// are detected through `git ls-files` (tracked and untracked, not ignored) under the current
// directory; outside a git work tree all rounds run.
import path from "node:path"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import {
    statSync, readFileSync, writeFileSync,
} from "node:fs"
import { spawnSync, type SpawnSyncReturns } from "node:child_process"

// ESLint's MAX_AUTOFIX_PASSES
const maxRounds = 10
// Files oxlint lints (JS/TS, and the script blocks of Vue/Svelte/Astro files)
const lintable = /\.(?:[cm]?[jt]sx?|vue|svelte|astro)$/u

function isFile(file: string): boolean {
    return statSync(file, { throwIfNoEntry: false })?.isFile() ?? false
}

// Content hash of every lintable file, by absolute path; undefined outside a git work tree.
function snapshot(cwd: string): Map<string, string> | undefined {
    const listed = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd, encoding: "utf8" })

    if (listed.status !== 0) {
        return undefined
    }

    const names = listed.stdout.split("\0")
    const files = names.map((name) => path.join(cwd, name)).filter((name) => lintable.test(name) && isFile(name))

    return new Map(files.map((file) => [file, hashOf(file)]))
}

function hashOf(file: string): string {
    const hash = createHash("sha1")

    hash.update(readFileSync(file))

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

interface Rounds {
    // Files that went back to their text of two rounds earlier, with that text
    circular:      Map<string, Buffer>
    hashes:        Map<string, string>
    hashesBefore?: Map<string, string>
}

interface FixRun {
    cwd:     string
    // Undefined outside a git work tree: changes are not tracked, all rounds run
    rounds?: Rounds
    args:    string[]
}

// Records this round's changes; returns whether any file (not already circular) changed.
function recordRound(rounds: Rounds, after: Map<string, string>): boolean {
    const changed = [...after].filter(([file, hash]) => rounds.hashes.get(file) !== hash)

    for (const [file, hash] of changed) {
        if (rounds.hashesBefore?.get(file) === hash) {
            rounds.circular.set(file, readFileSync(file))
            process.stderr.write(`Circular fixes detected while fixing ${file}. It is likely that you have conflicting rules in your configuration.\n`)
        }
    }
    rounds.hashesBefore = rounds.hashes
    rounds.hashes = after

    return changed.length > 0
}

function startRun(args: string[], cwd: string): FixRun {
    const hashes = snapshot(cwd)

    return {
        args, cwd, rounds: hashes === undefined ? undefined : { circular: new Map<string, Buffer>(), hashes },
    }
}

// One round of `oxlint --fix`, then its fixes to files with circular fixes are undone. Returns
// oxlint's result if this was the last round (no file changed, or oxlint did not finish).
function fixRound(run: FixRun): SpawnSyncReturns<string> | undefined {
    const result = oxlint(["--fix", ...run.args], run.cwd)

    for (const [file, text] of run.rounds?.circular ?? []) {
        writeFileSync(file, text)
    }

    const isChanged = run.rounds === undefined || recordRound(run.rounds, snapshot(run.cwd) ?? new Map<string, string>())

    return result.status === null || !isChanged ? result : undefined
}

// The last round's report; after circular fixes were undone, it may be stale: lint again.
function finalReport(last: SpawnSyncReturns<string>, run: FixRun): number {
    const hasUndone = last.status !== null && (run.rounds?.circular.size ?? 0) > 0

    return report(hasUndone ? oxlint(run.args, run.cwd) : last)
}

/**
 * Run `oxlint --fix <args>` up to 10 times, until a round changes no file, then print that
 * round's report and return its exit status. If the 10th round still changed files, or a file had
 * circular fixes, lint once more without fixing (as ESLint does) and report that.
 */
export function runOxlintFix(args: string[], options?: { cwd?: string }): number {
    const run = startRun(args, options?.cwd ?? process.cwd())

    for (let round = 1; round <= maxRounds; round++) {
        const last = fixRound(run)

        if (last !== undefined) {
            return finalReport(last, run)
        }
    }

    return report(oxlint(args, run.cwd))
}
