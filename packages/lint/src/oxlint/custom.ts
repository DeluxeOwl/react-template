import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// Our own rules (packages/lint/src/custom), run by oxlint as a JS plugin. From source (in this repo)
// the plugin is the .ts file, which Node loads directly; from the published package it is the built .js.
const pluginFile = import.meta.url.endsWith(".ts") ? "../custom/oxlint-plugin.ts" : "../custom/oxlint-plugin.js"
const customPlugin = fileURLToPath(new URL(pluginFile, import.meta.url))

export const customConfig = {
    jsPlugins: [
        {
            name:      "custom",
            specifier: customPlugin,
        },
    ],
    rules: {
        "custom/no-bare-enable-directive":         ["error"],
        "custom/no-margin-on-root-jsx":            ["error"],
        "custom/no-provider-with-static-children": ["error"],
        "custom/prefer-state-class":               ["error"],
        "custom/require-jsx-return-type":          ["error"],
    },
} satisfies OxlintConfig

// The view-only and AbortController rules, ast-grep's until 0.5.0 (docs/oxlint-migration.md,
// Phase 9). ast-grep ran them on .tsx files only, so the React preset does too.
export const customReactConfig = {
    overrides: [
        {
            files: ["**/*.tsx"],
            rules: {
                "custom/no-array-methods-in-component":               ["error"],
                "custom/no-builtin-hooks-in-component":               ["error"],
                "custom/no-filter-in-component":                      ["error"],
                "custom/no-logic-expressions-in-component":           ["error"],
                "custom/no-logic-in-map-callback":                    ["error"],
                "custom/no-loops-in-component":                       ["error"],
                "custom/no-multiple-hooks-in-component":              ["error"],
                "custom/no-object-spread-in-component":               ["error"],
                "custom/no-switch-in-component":                      ["error"],
                "custom/no-ternary-assignment-in-component":          ["error"],
                "custom/use-abort-controller-for-multiple-listeners": ["error"],
            },
        },
    ],
} satisfies OxlintConfig
