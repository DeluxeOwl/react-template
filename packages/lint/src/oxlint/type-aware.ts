import type { OxlintConfig } from "oxlint"

// Type-aware rules: oxlint runs them through tsgolint (`oxlint-tsgolint`) when `options.typeAware` is on.
//
// Type-aware mode turns on every type-aware rule our categories select (55 of these). So every
// type-aware rule oxlint 1.86 has is listed here, on or off on purpose. Off:
// `non-nullable-type-assertion-style` (it asks for `x!`, which `no-non-null-assertion` warns
// about) and `prefer-readonly-parameter-types` (`readonly` on nearly every parameter). Keep this
// list complete when upgrading oxlint (`oxlint --rules --format=json`, `type_aware: true`).
export const typeAwareConfig = {
    options: {
        typeAware: true,
    },
    overrides: [
        {
            // Tests build DTOs and fixtures with `as`.
            files: ["**/*.test.ts", "**/*.test.tsx"],
            rules: {
                "typescript/no-unsafe-type-assertion": "off",
            },
        },
    ],
    rules: {
        "typescript/await-thenable":                         "error",
        "typescript/consistent-return":                      "error",
        "typescript/consistent-type-exports":                "error",
        "typescript/dot-notation":                           "error",
        "typescript/no-array-delete":                        "error",
        "typescript/no-base-to-string":                      "error",
        "typescript/no-confusing-void-expression":           "error",
        "typescript/no-deprecated":                          "error",
        "typescript/no-duplicate-type-constituents":         "error",
        "typescript/no-floating-promises":                   "error",
        "typescript/no-for-in-array":                        "error",
        "typescript/no-generated-empty-object-type":         "error",
        "typescript/no-implied-eval":                        "error",
        "typescript/no-meaningless-void-operator":           "error",
        "typescript/no-misused-promises":                    "error",
        "typescript/no-misused-spread":                      "error",
        "typescript/no-mixed-enums":                         "error",
        "typescript/no-redundant-type-constituents":         "error",
        "typescript/no-unnecessary-boolean-literal-compare": "error",
        "typescript/no-unnecessary-condition":               "error",
        "typescript/no-unnecessary-qualifier":               "error",
        "typescript/no-unnecessary-template-expression":     "error",
        "typescript/no-unnecessary-type-arguments":          "error",
        "typescript/no-unnecessary-type-assertion":          "error",
        "typescript/no-unnecessary-type-conversion":         "error",
        "typescript/no-unnecessary-type-parameters":         "error",
        "typescript/no-unsafe-argument":                     "error",
        "typescript/no-unsafe-assignment":                   "error",
        "typescript/no-unsafe-call":                         "error",
        "typescript/no-unsafe-enum-comparison":              "error",
        "typescript/no-unsafe-member-access":                "error",
        "typescript/no-unsafe-return":                       "error",
        "typescript/no-unsafe-type-assertion":               "error",
        "typescript/no-unsafe-unary-minus":                  "error",
        "typescript/no-useless-default-assignment":          "error",
        "typescript/non-nullable-type-assertion-style":      "off",
        "typescript/only-throw-error":                       "error",
        "typescript/prefer-find":                            "error",
        "typescript/prefer-includes":                        "error",
        "typescript/prefer-nullish-coalescing":              "error",
        "typescript/prefer-optional-chain":                  "error",
        "typescript/prefer-promise-reject-errors":           "error",
        "typescript/prefer-readonly":                        "error",
        "typescript/prefer-readonly-parameter-types":        "off",
        "typescript/prefer-reduce-type-parameter":           "error",
        "typescript/prefer-regexp-exec":                     "error",
        "typescript/prefer-return-this-type":                "error",
        "typescript/prefer-string-starts-ends-with":         "error",
        "typescript/promise-function-async":                 "error",
        "typescript/related-getter-setter-pairs":            "error",
        "typescript/require-array-sort-compare":             "error",
        "typescript/require-await":                          "error",
        "typescript/restrict-plus-operands":                 "error",
        "typescript/restrict-template-expressions":          "error",
        "typescript/return-await":                           "error",
        // Numbers and strings too: `{count && <List />}` renders 0 in React.
        "typescript/strict-boolean-expressions":             ["error", { allowNumber: false, allowString: false }],
        "typescript/strict-void-return":                     "error",
        "typescript/switch-exhaustiveness-check":            "error",
        "typescript/unbound-method":                         "error",
        "typescript/use-unknown-in-catch-callback-variable": "error",
    },
} satisfies OxlintConfig
