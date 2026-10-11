// The built preset, as in the other workspaces: oxlint loads every workspace config in one process
// (from the root, and in VS Code), and the custom plugin must come from one file, or `custom` is
// registered twice and this config fails to load. After changing a preset, `bun run postinstall`.
import { createOxlintConfig } from "@deluxeowl/lint/oxlint"

export default createOxlintConfig({
    // Vendored third-party rule code (generated, see vendor/*/README.md).
    ignorePatterns: ["vendor/**"],
    nested:         true,
})
