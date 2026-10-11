import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// eslint-plugin-unicorn rules that oxlint has no matching native version of, run from our vendored
// copy of eslint-plugin-unicorn 64.0.0 (packages/lint/vendor/unicorn, generated — see its README)
// under the alias `unicorn-js` (oxlint reserves `unicorn` for its native rules). Options are exactly
// what the ESLint preset resolved to; parity with ESLint (diagnostics and byte-identical --fix
// output) is recorded in docs/oxlint-migration.md.
const unicornPlugin = fileURLToPath(new URL("../../vendor/unicorn/index.js", import.meta.url))

export const unicornConfig = {
    jsPlugins: [
        {
            name:      "unicorn-js",
            specifier: unicornPlugin,
        },
    ],
    rules: {
        "unicorn-js/better-regex": [
            "error",
            { sortCharacterClasses: true },
        ],
        "unicorn-js/consistent-destructuring": ["error"],
        "unicorn-js/import-style":             [
            "error",
            {
                styles: {
                    "@react-template/core": {
                        named:     false,
                        namespace: true,
                    },
                },
            },
        ],
    },
} satisfies OxlintConfig
