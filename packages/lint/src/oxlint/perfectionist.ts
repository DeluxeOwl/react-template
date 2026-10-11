import type { DummyRule, OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// The perfectionist sorting rules, run by oxlint from our vendored copy of
// eslint-plugin-perfectionist 5.9.0 (packages/lint/vendor/perfectionist, generated — see its README).
// Options are exactly what the ESLint preset resolved to (`configs["recommended-natural"]` plus the
// overrides that used to live in `../index.ts`); parity with ESLint (diagnostics and byte-identical
// --fix output, also together with the @stylistic rules) is recorded in docs/oxlint-migration.md.
const perfectionistPlugin = fileURLToPath(new URL("../../vendor/perfectionist/index.js", import.meta.url))

// By line length (`order` defaults to "asc": shortest first); ties alphabetical.
const lineLength: DummyRule = [
    "error",
    {
        fallbackSort: {
            order: "asc",
            type:  "alphabetical",
        },
        type: "line-length",
    },
]

// The `recommended-natural` preset's setting.
const natural: DummyRule = [
    "error",
    {
        order: "asc",
        type:  "natural",
    },
]

export const perfectionistConfig = {
    jsPlugins: [
        {
            name:      "perfectionist",
            specifier: perfectionistPlugin,
        },
    ],
    rules: {
        "perfectionist/sort-array-includes": lineLength,
        "perfectionist/sort-classes":        [
            "error",
            {
                groups: [
                    "property",
                    "constructor",
                    "static-method",
                    "unknown",
                ],
                order: "asc",
                type:  "alphabetical",
            },
        ],
        "perfectionist/sort-decorators":            natural,
        "perfectionist/sort-enums":                 natural,
        "perfectionist/sort-export-attributes":     natural,
        "perfectionist/sort-exports":               lineLength,
        "perfectionist/sort-heritage-clauses":      lineLength,
        "perfectionist/sort-import-attributes":     natural,
        "perfectionist/sort-imports":               lineLength,
        "perfectionist/sort-interfaces":            lineLength,
        "perfectionist/sort-intersection-types":    natural,
        "perfectionist/sort-jsx-props":             natural,
        "perfectionist/sort-maps":                  lineLength,
        "perfectionist/sort-named-exports":         natural,
        "perfectionist/sort-named-imports":         lineLength,
        "perfectionist/sort-object-types":          natural,
        "perfectionist/sort-objects":               natural,
        "perfectionist/sort-sets":                  lineLength,
        "perfectionist/sort-switch-case":           natural,
        "perfectionist/sort-union-types":           natural,
        "perfectionist/sort-variable-declarations": natural,
    },
} satisfies OxlintConfig
