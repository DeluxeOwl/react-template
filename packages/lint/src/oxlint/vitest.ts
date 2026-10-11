import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// @vitest/eslint-plugin rules, run by oxlint from our vendored copy of the plugin 1.6.16
// (packages/lint/vendor/vitest, generated — see its README) under the alias `vitest-js`: oxlint
// reserves the `vitest` name for its native plugin, whose versions of these rules report
// differently. ESLint ran the plugin's `all` config on test files, so every rule is a warning
// with its default options, listed as ESLint resolved them; parity with ESLint is recorded in
// scratch/oxlint-migration.md. Two defaults are written differently:
// - expect-expect: ESLint's resolved list repeats "expectTypeOf"/"assertType" because the rule
//   appends them to its default array on every file (with `typecheck`); the copy adds them once.
// - require-top-level-describe: its default `maxNumberOfTopLevelDescribes: Infinity` can't be
//   written in a config (JSON has no Infinity), so the rule's own default applies.
// Four rules are not run: prefer-describe-function-title, valid-title and unbound-method use
// the TypeScript type checker; prefer-importing-vitest-globals' fixes can produce code oxc can't
// parse, which stops oxlint's fix rounds early.
const vitestPlugin = fileURLToPath(new URL("../../vendor/vitest/index.js", import.meta.url))

export const vitestConfig = {
    jsPlugins: [
        {
            name:      "vitest-js",
            specifier: vitestPlugin,
        },
    ],
    overrides: [
        {
            files: ["**/*.test.ts", "**/*.test.tsx"],
            rules: {
                "vitest-js/consistent-each-for":               ["warn", {}],
                "vitest-js/consistent-test-filename":          ["warn", { allTestPattern: ".*\\.(test|spec)\\.[tj]sx?$", pattern: ".*\\.test\\.[tj]sx?$" }],
                "vitest-js/consistent-test-it":                ["warn", {}],
                "vitest-js/consistent-vitest-vi":              ["warn", { fn: "vi" }],
                "vitest-js/expect-expect":                     ["warn", { additionalTestBlockFunctions: [], assertFunctionNames: ["expect", "assert"] }],
                "vitest-js/hoisted-apis-on-top":               ["warn"],
                "vitest-js/max-nested-describe":               ["warn", { max: 5 }],
                "vitest-js/no-alias-methods":                  ["warn"],
                "vitest-js/no-commented-out-tests":            ["warn"],
                "vitest-js/no-conditional-expect":             ["warn", { expectAssertions: false }],
                "vitest-js/no-conditional-in-test":            ["warn"],
                "vitest-js/no-conditional-tests":              ["warn"],
                "vitest-js/no-disabled-tests":                 ["warn"],
                "vitest-js/no-duplicate-hooks":                ["warn"],
                "vitest-js/no-focused-tests":                  ["warn", { fixable: true }],
                "vitest-js/no-hooks":                          ["warn", { allow: [] }],
                "vitest-js/no-import-node-test":               ["warn"],
                "vitest-js/no-interpolation-in-snapshots":     ["warn"],
                "vitest-js/no-large-snapshots":                ["warn", {}],
                "vitest-js/no-mocks-import":                   ["warn"],
                "vitest-js/no-restricted-matchers":            ["warn", {}],
                "vitest-js/no-restricted-vi-methods":          ["warn", {}],
                "vitest-js/no-standalone-expect":              ["warn", { additionalTestBlockFunctions: [] }],
                "vitest-js/no-test-prefixes":                  ["warn"],
                "vitest-js/no-test-return-statement":          ["warn"],
                "vitest-js/no-unneeded-async-expect-function": ["warn"],
                "vitest-js/padding-around-after-all-blocks":   ["warn"],
                "vitest-js/padding-around-after-each-blocks":  ["warn"],
                "vitest-js/padding-around-all":                ["warn"],
                "vitest-js/padding-around-before-all-blocks":  ["warn"],
                "vitest-js/padding-around-before-each-blocks": ["warn"],
                "vitest-js/padding-around-describe-blocks":    ["warn"],
                "vitest-js/padding-around-expect-groups":      ["warn"],
                "vitest-js/padding-around-test-blocks":        ["warn"],
                "vitest-js/prefer-called-exactly-once-with":   ["warn"],
                "vitest-js/prefer-called-times":               ["warn"],
                "vitest-js/prefer-called-with":                ["warn"],
                "vitest-js/prefer-comparison-matcher":         ["warn"],
                "vitest-js/prefer-each":                       ["warn"],
                "vitest-js/prefer-equality-matcher":           ["warn"],
                "vitest-js/prefer-expect-assertions":          [
                    "warn", {
                        onlyFunctionsWithAsyncKeyword: false, onlyFunctionsWithExpectInCallback: false, onlyFunctionsWithExpectInLoop: false,
                    },
                ],
                "vitest-js/prefer-expect-resolves": ["warn"],
                "vitest-js/prefer-expect-type-of":  ["warn"],
                "vitest-js/prefer-hooks-in-order":  ["warn"],
                "vitest-js/prefer-hooks-on-top":    ["warn"],
                "vitest-js/prefer-import-in-mock":  ["warn", { fixable: true }],
                "vitest-js/prefer-lowercase-title": [
                    "warn", {
                        allowedPrefixes: [], ignore: [], ignoreTopLevelDescribe: false, lowercaseFirstCharacterOnly: true,
                    },
                ],
                "vitest-js/prefer-mock-promise-shorthand":                       ["warn"],
                "vitest-js/prefer-snapshot-hint":                                ["warn", "multi"],
                "vitest-js/prefer-spy-on":                                       ["warn"],
                "vitest-js/prefer-strict-boolean-matchers":                      ["warn"],
                "vitest-js/prefer-strict-equal":                                 ["warn"],
                "vitest-js/prefer-to-be":                                        ["warn"],
                "vitest-js/prefer-to-be-object":                                 ["warn"],
                "vitest-js/prefer-to-contain":                                   ["warn"],
                "vitest-js/prefer-to-have-been-called-times":                    ["warn"],
                "vitest-js/prefer-to-have-length":                               ["warn"],
                "vitest-js/prefer-todo":                                         ["warn"],
                "vitest-js/prefer-vi-mocked":                                    ["warn"],
                "vitest-js/require-awaited-expect-poll":                         ["warn"],
                "vitest-js/require-hook":                                        ["warn", { allowedFunctionCalls: [] }],
                "vitest-js/require-local-test-context-for-concurrent-snapshots": ["warn"],
                "vitest-js/require-mock-type-parameters":                        ["warn", { checkImportFunctions: false }],
                "vitest-js/require-to-throw-message":                            ["warn"],
                "vitest-js/require-top-level-describe":                          ["warn"],
                "vitest-js/valid-describe-callback":                             ["warn"],
                "vitest-js/valid-expect":                                        [
                    "warn", {
                        alwaysAwait: false, asyncMatchers: ["toReject", "toResolve"], maxArgs: 1, minArgs: 1,
                    },
                ],
                "vitest-js/valid-expect-in-promise": ["warn"],
            },
        },
    ],
    settings: {
        vitest: {
            typecheck: true,
        },
    },
} satisfies OxlintConfig
