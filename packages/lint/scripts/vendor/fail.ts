// The tool stops at the first problem: there is nothing to recover, and a half-written vendor
// directory is never left behind (see vendor-plugin.ts).
export function fail(message: string): never {
    console.error(`vendor: ${message}`)

    return process.exit(1)
}
