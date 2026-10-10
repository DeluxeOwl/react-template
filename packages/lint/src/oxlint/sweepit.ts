import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// The sweepit rules, run by oxlint from our vendored copy of eslint-plugin-sweepit 0.0.23
// (packages/lint/vendor/sweepit, generated — see its README). Options are exactly what the ESLint
// preset used to set; parity with ESLint (diagnostics; the rules have no fixes) is recorded in
// scratch/oxlint-migration.md. `sweepit/no-array-props` and `sweepit/no-object-props` stay in
// ESLint (`../react.ts`): they use the TypeScript type checker, which oxlint JS plugins don't get.
const sweepitPlugin = {
    name:      "sweepit",
    specifier: fileURLToPath(new URL("../../vendor/sweepit/index.js", import.meta.url)),
}
const maxComplexity = 10

// All workspaces.
export const sweepitConfig = {
    jsPlugins: [sweepitPlugin],
    rules:     {
        "sweepit/complexity": [
            "error",
            {
                max:     maxComplexity,
                variant: "modified",
            },
        ],
        "sweepit/no-return-object-repetition": "error",
    },
} satisfies OxlintConfig

// React workspaces (on top of `sweepitConfig`).
export const sweepitReactConfig = {
    jsPlugins: [sweepitPlugin],
    rules:     {
        "sweepit/jsx-bem-compound-naming":       "error",
        "sweepit/jsx-flat-owner-tree":           "error",
        "sweepit/jsx-server-action-prop-suffix": "error",
        "sweepit/max-custom-props":              "error",
        "sweepit/no-boolean-capability-props":   [
            "error",
            {
                ignore:                   ["asChild"],
                ignoreNativeBooleanProps: true,
            },
        ],
        "sweepit/no-componenttype-props":             "error",
        "sweepit/no-custom-kebab-case-props":         "error",
        "sweepit/no-element-props":                   "error",
        "sweepit/no-exported-context-hooks":          "error",
        "sweepit/no-handle-prefix-utils":             "error",
        "sweepit/no-handler-return-type":             "error",
        "sweepit/no-hook-jsx":                        "error",
        "sweepit/no-optional-props-without-defaults": [
            "error",
            {
                ignore: ["on*", "ref", "render"],
            },
        ],
        "sweepit/no-prefixed-prop-bundles": "error",
        "sweepit/no-prop-drilling":         [
            "error",
            {
                allowedDepth:      1,
                ignorePropsSpread: true,
            },
        ],
        "sweepit/no-render-helper-functions": "error",
        "sweepit/no-set-prefix-utils":        "error",
        "sweepit/no-title-case-props":        "error",
    },
} satisfies OxlintConfig
