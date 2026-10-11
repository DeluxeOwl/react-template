import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// @tanstack/eslint-plugin-query rules run by oxlint from our vendored copy of the plugin 5.100.9
// (packages/lint/vendor/tanstack-query, generated — see its README). oxlint has no native versions.
// Severities are exactly what the ESLint preset (`flat/recommended`) resolved to; parity with ESLint
// (diagnostics, byte-identical --fix output, identical suggestions for exhaustive-deps) is recorded
// in scratch/oxlint-migration.md. `no-void-query-fn` is not run: it needs the type checker.
// `infinite-query-property-order` and `mutation-property-order` are off: they and
// `perfectionist/sort-objects` reorder the same options, each undoing the other's fix, and
// perfectionist covers every object. TanStack orders these options for TypeScript inference
// (`onMutate` before `onError` types the context); a wrong order shows up as a type error where
// the inferred type is used.
const tanstackQueryPlugin = fileURLToPath(new URL("../../vendor/tanstack-query/index.js", import.meta.url))

export const tanstackQueryConfig = {
    jsPlugins: [
        {
            name:      "@tanstack/query",
            specifier: tanstackQueryPlugin,
        },
    ],
    rules: {
        "@tanstack/query/exhaustive-deps":               ["error"],
        "@tanstack/query/infinite-query-property-order": ["off"],
        "@tanstack/query/mutation-property-order":       ["off"],
        "@tanstack/query/no-rest-destructuring":         ["warn"],
        "@tanstack/query/no-unstable-deps":              ["error"],
        "@tanstack/query/stable-query-client":           ["error"],
    },
} satisfies OxlintConfig
