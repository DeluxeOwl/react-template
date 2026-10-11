import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// eslint-plugin-import-zod 1.2.1 (its `recommended` config: one rule), run by oxlint from our
// vendored copy (packages/lint/vendor/import-zod, generated — see its README). Parity with ESLint
// is recorded in docs/oxlint-migration.md.
const importZodPlugin = fileURLToPath(new URL("../../vendor/import-zod/index.js", import.meta.url))

export const importZodConfig = {
    jsPlugins: [
        {
            name:      "import-zod",
            specifier: importZodPlugin,
        },
    ],
    rules: {
        "import-zod/prefer-zod-namespace": ["error"],
    },
} satisfies OxlintConfig
