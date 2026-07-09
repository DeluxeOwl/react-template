import { runMain, defineCommand } from "citty"

import { parseAndRun } from "./subcommands/local-https"
import {
    reportResults, findDuplicates, findAllFunctions,
} from "./subcommands/find-duplicate-functions"

const findDuplicatesCommand = defineCommand({
    args: {
        dirs: {
            description: "Directories to search",
            multiple:    true,
            required:    false,
            type:        "positional",
        },
    },
    meta: {
        description: "Find duplicate function names across the codebase",
        name:        "find-duplicate-functions",
    },
    async run({ args }) {
        const dirs = [args.dirs ?? "."].flat()

        console.log(`Searching for duplicate function names in: ${dirs.join(", ")}\n`)

        const functions = await findAllFunctions(dirs)
        const duplicates = findDuplicates(functions)

        reportResults(functions, duplicates)
    },
})

const localHttpsCommand = defineCommand({
    args: {
        ip: {
            description: "IP address to advertise (auto-detected if not provided)",
            required:    false,
            type:        "string",
        },
        services: {
            description: "Comma-separated list of domain:host:port or domain:port (defaults to 127.0.0.1)",
            required:    true,
            type:        "string",
        },
    },
    meta: {
        description: "Start local HTTPS reverse proxy with mDNS advertisement",
        name:        "local-https",
    },
    async run({ args }) {
        await parseAndRun(args.ip, args.services)
    },
})

const main = defineCommand({
    meta: {
        description: "CLI utilities for the monorepo",
        name:        "scripts",
    },
    subCommands: {
        "find-duplicate-functions": findDuplicatesCommand,
        "local-https":              localHttpsCommand,
    },
})

try {
    await runMain(main)
} catch (error) {
    console.error(error)
    process.exit(1)
}

