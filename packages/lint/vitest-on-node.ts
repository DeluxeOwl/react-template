import path from "node:path"
import { spawnSync } from "node:child_process"
import { existsSync, realpathSync } from "node:fs"

// Runs vitest on Node: oxlint's RuleTester (the src/custom tests) refuses to run on Bun.
// The repo's bunfig.toml sets `run.bun = true`, so a root `bun run test` puts a directory whose
// `node` is Bun first on PATH, and every workspace's vitest inherits it. Dropping such
// directories from PATH starts vitest, and the workers it forks, on the real Node.

function isBunPosingAsNode(dir: string): boolean {
    const node = path.join(dir, "node")
    return existsSync(node) && path.basename(realpathSync(node)) === "bun"
}

// argv: the runtime, this file, then vitest's arguments.
const launcherArgumentCount = 2
const vitestArguments = process.argv.slice(launcherArgumentCount)

const searchPath = (process.env.PATH ?? "")
    .split(path.delimiter)
    .filter((dir) => !isBunPosingAsNode(dir))
    .join(path.delimiter)

const result = spawnSync("vitest", vitestArguments, {
    env:   { ...process.env, PATH: searchPath },
    stdio: "inherit",
})

process.exitCode = result.status ?? 1
