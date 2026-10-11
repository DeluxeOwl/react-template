import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// eslint-plugin-unused-imports 4.4.1, run by oxlint from our vendored copy
// (packages/lint/vendor/unused-imports, generated — see its README). Severities and options are
// exactly what the ESLint preset had; parity with ESLint (diagnostics and byte-identical --fix
// output) is recorded in docs/oxlint-migration.md. oxlint's native `no-unused-vars`
// (typescript.ts) stays on with the same options, as before the migration: it reports the same
// problems under its own id, and plain --fix doesn't apply its fixes, so the two don't compete.
const unusedImportsPlugin = fileURLToPath(new URL("../../vendor/unused-imports/index.js", import.meta.url))

export const unusedImportsConfig = {
    jsPlugins: [
        {
            name:      "unused-imports",
            specifier: unusedImportsPlugin,
        },
    ],
    rules: {
        "unused-imports/no-unused-imports": ["error"],
        "unused-imports/no-unused-vars":    [
            "warn",
            {
                args:              "after-used",
                argsIgnorePattern: "^_",
                vars:              "all",
                varsIgnorePattern: "^_",
            },
        ],
    },
} satisfies OxlintConfig
