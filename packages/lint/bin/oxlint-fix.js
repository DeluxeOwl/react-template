#!/usr/bin/env node
// `oxlint --fix` until the files stop changing, like `eslint --fix`: see src/oxlint/fix.ts.
// Plain JS on purpose: the file must exist before `dist/` is built, or package managers skip the link.
import { runOxlintFix } from "../dist/oxlint/index.js"

// process.argv: [runtime, script, ...arguments]
const firstArgument = 2

process.exitCode = runOxlintFix(process.argv.slice(firstArgument))
