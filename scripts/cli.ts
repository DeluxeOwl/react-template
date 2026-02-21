import { runMain, defineCommand } from "citty"

import { reportResults, findDuplicates, findAllFunctions } from "./subcommands/find-duplicate-functions"
import { syncRootTsconfig, syncPackageTsconfigs, findWorkspacePackages } from "./subcommands/sync-tsconfig"

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

const syncTsconfigCommand = defineCommand({
    meta: {
        description: "Sync TypeScript project references across the monorepo",
        name:        "sync-tsconfig",
    },
    run: async () => {
        console.log("Syncing tsconfig references...\n")

        const packages = await findWorkspacePackages()
        console.log(
            `Found ${packages.length} workspace packages: ${packages.map((p) => p.name).join(", ")}\n`,
        )

        await syncRootTsconfig(packages)
        await syncPackageTsconfigs(packages)

        console.log("\nDone!")
    },
})

const main = defineCommand({
    meta: {
        description: "CLI utilities for the monorepo",
        name:        "scripts",
    },
    subCommands: {
        "find-duplicate-functions": findDuplicatesCommand,
        "sync-tsconfig":            syncTsconfigCommand,
    },
})

try {
    await runMain(main)
} catch (error) {
    console.error(error)
    process.exit(1)
}

