import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// eslint-plugin-react-render-types 0.7.6: only `renders-uses-vars` runs in oxlint, from our vendored
// copy (packages/lint/vendor/react-render-types, generated — see its README). It reports nothing:
// it marks components named in `@renders` JSDoc tags as used, for unused-imports' rules, which run in
// the same oxlint JS plugin host (unusedImportsConfig). The plugin's other rules read TypeScript
// types, which oxlint JS plugins don't get, so they stay in ESLint.
const reactRenderTypesPlugin = fileURLToPath(new URL("../../vendor/react-render-types/index.js", import.meta.url))

export const reactRenderTypesConfig = {
    jsPlugins: [
        {
            name:      "react-render-types",
            specifier: reactRenderTypesPlugin,
        },
    ],
    rules: {
        "react-render-types/renders-uses-vars": ["error"],
    },
} satisfies OxlintConfig
