import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// eslint-plugin-react-refresh's only rule, run by oxlint from our vendored copy of the plugin 0.5.2
// (packages/lint/vendor/react-refresh, generated — see its README). oxlint's native
// `react/only-export-components` reports different findings (styled templates, unknown HOCs,
// anonymous exports, enums), so it stays off. Severity and options are what the ESLint preset
// (`recommended`) resolved to; parity with ESLint is recorded in scratch/oxlint-migration.md.
const reactRefreshPlugin = fileURLToPath(new URL("../../vendor/react-refresh/index.js", import.meta.url))

export const reactRefreshConfig = {
    jsPlugins: [
        {
            name:      "react-refresh",
            specifier: reactRefreshPlugin,
        },
    ],
    rules: {
        "react-refresh/only-export-components": ["error"],
    },
} satisfies OxlintConfig
