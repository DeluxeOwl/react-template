import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// eslint-plugin-react-hooks 7.1.1, run by oxlint from our vendored copy
// (packages/lint/vendor/react-hooks, generated — see its README) under the alias `react-hooks-js`
// (oxlint reserves `react-hooks`). These are the rules of its `recommended` config plus `todo`,
// as the ESLint preset had them; `exhaustive-deps` was already oxlint's native
// `react/exhaustive-deps`. The React Compiler rules run the upstream Babel-based compiler, so they
// report what ESLint reported. oxlint's native versions find components differently and anchor
// reports elsewhere, so they're off here (D-018 in scratch/oxlint-migration.md). Severities are ESLint's, except
// `incompatible-library`: ESLint warned, but its native twin was an error, so it stays an error
// (D-018). Parity with ESLint is recorded in scratch/oxlint-migration.md.
const reactHooksPlugin = fileURLToPath(new URL("../../vendor/react-hooks/index.js", import.meta.url))

export const reactHooksConfig = {
    jsPlugins: [
        {
            name:      "react-hooks-js",
            specifier: reactHooksPlugin,
        },
    ],
    rules: {
        "react-hooks-js/config":                      ["error"],
        "react-hooks-js/error-boundaries":            ["error"],
        "react-hooks-js/gating":                      ["error"],
        "react-hooks-js/globals":                     ["error"],
        "react-hooks-js/immutability":                ["error"],
        "react-hooks-js/incompatible-library":        ["error"],
        "react-hooks-js/preserve-manual-memoization": ["error"],
        "react-hooks-js/purity":                      ["error"],
        "react-hooks-js/refs":                        ["error"],
        "react-hooks-js/rules-of-hooks":              ["error"],
        "react-hooks-js/set-state-in-effect":         ["error"],
        "react-hooks-js/set-state-in-render":         ["error"],
        "react-hooks-js/static-components":           ["error"],
        "react-hooks-js/todo":                        ["error"],
        "react-hooks-js/unsupported-syntax":          ["warn"],
        "react-hooks-js/use-memo":                    ["error"],
        // oxlint's native twins (D-018).
        "react/error-boundaries":                     "off",
        "react/globals":                              "off",
        "react/immutability":                         "off",
        "react/incompatible-library":                 "off",
        "react/preserve-manual-memoization":          "off",
        "react/purity":                               "off",
        "react/refs":                                 "off",
        "react/rules-of-hooks":                       "off",
        "react/set-state-in-effect":                  "off",
        "react/set-state-in-render":                  "off",
        "react/static-components":                    "off",
        "react/todo":                                 "off",
        "react/unsupported-syntax":                   "off",
        "react/use-memo":                             "off",
    },
} satisfies OxlintConfig
