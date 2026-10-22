import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

import oxlintByethrowPlugin from "./byethrow-plugin.ts"

// A local entry keeps plugin resolution and dependency ownership in this package, including
// when Knip reads a consuming workspace's config. Source fixtures use .ts; the published build uses .js.
const pluginFile = import.meta.url.endsWith(".ts") ? "./byethrow-plugin.ts" : "./byethrow-plugin.js"
const byethrowPlugins = [
    {
        name:      "byethrow",
        specifier: fileURLToPath(new URL(pluginFile, import.meta.url)),
    },
]

export const byethrowConfig: OxlintConfig = {
    ...oxlintByethrowPlugin.recommended,
    jsPlugins: byethrowPlugins,
    overrides: oxlintByethrowPlugin.recommended.overrides?.map((override) => ({
        ...override,
        jsPlugins: byethrowPlugins,
    })),
}
