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
        "custom/no-margin-on-root-jsx":            ["error"],
        "custom/no-provider-with-static-children": ["error"],
        "custom/prefer-discriminated-union":       ["warn"],
        "custom/prefer-state-class":               ["error"],
        "custom/require-jsx-return-type":          ["error"],
    },
} satisfies OxlintConfig
