import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// The 9 rules of eslint-plugin-import-x our ESLint preset ran (`flat/recommended` plus
// `no-dynamic-require`), run by oxlint from our vendored copy of the plugin 4.16.2
// (packages/lint/vendor/import-x, generated — see its README), under the alias `import-x-js` (oxlint
// reserves `import-x`). Imported modules are parsed with @typescript-eslint/parser and resolved with
// eslint-import-resolver-typescript ({ alwaysTryTypes, bun, project: the importing file's package }),
// as the ESLint preset configured them; oxlint settings cannot carry a resolver object, so the vendored
// copy creates it. Parity with ESLint is recorded in scratch/oxlint-migration.md.
//
// oxlint's native `import/*` versions report different findings (resolution, spans, fixes), so they
// are off, including the two nursery ones a later oxlint could turn on. Four of the rules were `warn`
// in ESLint while the native rules failed the lint at `error`; they stay `error` here, so code that
// failed the lint still does (D-018 in scratch/oxlint-migration.md).
const importXPlugin = fileURLToPath(new URL("../../vendor/import-x/index.js", import.meta.url))

export const importXConfig = {
    jsPlugins: [
        {
            name:      "import-x-js",
            specifier: importXPlugin,
        },
    ],
    rules: {
        "import-x-js/default":                    ["error"],
        "import-x-js/export":                     ["error"],
        "import-x-js/named":                      ["error"],
        "import-x-js/namespace":                  ["error"],
        "import-x-js/no-duplicates":              ["error"],
        "import-x-js/no-dynamic-require":         ["error"],
        "import-x-js/no-named-as-default":        ["error"],
        "import-x-js/no-named-as-default-member": ["error"],
        "import-x-js/no-unresolved":              ["error"],
        "import/default":                         "off",
        "import/export":                          "off",
        "import/named":                           "off",
        "import/namespace":                       "off",
        "import/no-duplicates":                   "off",
        "import/no-dynamic-require":              "off",
        "import/no-named-as-default":             "off",
        "import/no-named-as-default-member":      "off",
    },
} satisfies OxlintConfig
