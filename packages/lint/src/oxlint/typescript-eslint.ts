import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// typescript-eslint rules run by oxlint from our vendored copy of @typescript-eslint/eslint-plugin
// 8.59.1 (packages/lint/vendor/typescript-eslint, generated — see its README), under the alias
// `typescript-eslint-js` (oxlint reserves `@typescript-eslint`). Options and the two file exemptions
// originated in the ESLint preset; migration parity (diagnostics and byte-identical --fix output)
// is recorded in docs/oxlint-migration.md. oxlint's native counterparts differ in
// spans, fixes and coverage, so the ones our categories switch on are turned off here.
const typescriptEslintPlugin = fileURLToPath(new URL("../../vendor/typescript-eslint/index.js", import.meta.url))

export const typescriptEslintConfig = {
    jsPlugins: [
        {
            name:      "typescript-eslint-js",
            specifier: typescriptEslintPlugin,
        },
    ],
    overrides: [
        // Inferred handler return types keep domain error unions complete.
        {
            files: [
                "**/command-*.ts",
                "**/query-*.ts",
                "**/*.command.ts",
                "**/*.query.ts",
            ],
            rules: {
                "typescript-eslint-js/explicit-function-return-type": "off",
            },
        },
        {
            files: [
                "**/*.test.ts",
                "**/*.test.tsx",
            ],
            rules: {
                "typescript-eslint-js/no-magic-numbers": "off",
            },
        },
    ],
    rules: {
        "eslint/no-array-constructor":                          "off",
        "typescript-eslint-js/array-type":                      ["error"],
        "typescript-eslint-js/ban-ts-comment":                  ["error"],
        "typescript-eslint-js/consistent-generic-constructors": ["error"],
        "typescript-eslint-js/consistent-indexed-object-style": ["error"],
        "typescript-eslint-js/consistent-type-definitions":     [
            "error",
            "interface",
        ],
        "typescript-eslint-js/explicit-function-return-type": [
            "error",
            {
                allowExpressions: true,
                allowIIFEs:       true,
            },
        ],
        // NOTE: I would like Go's naming conventions, like PascalCase anywhere, or at least for exports.
        // But I've decided against it. It would confuse the AI a lot or create an additional format step.
        // Typescript already has the `export` keyword.
        "typescript-eslint-js/naming-convention": [
            "warn",
            // 1. Exemption: Allow strictly underscores for unused parameters (e.g., _, __).
            // "format": null disables further casing checks for these specific matches.
            {
                filter: {
                    match: true,
                    regex: "^_+$",
                },
                format:   null,
                selector: "parameter",
            },
            // 2. Parameters: Must be strictly camelCase.
            // This rule applies to all parameters that did not match the _ exemption above.
            {
                format:             ["camelCase"],
                leadingUnderscore:  "forbid",
                selector:           "parameter",
                trailingUnderscore: "forbid",
            },
            // 3. Properties: allow anything
            {
                format:   null,
                selector: "property",
            },
            // Handler maps and visitor keys are methods when their values are functions, not properties.
            {
                format:    null,
                modifiers: ["requiresQuotes"],
                selector:  "objectLiteralMethod",
            },
            // 4. Global Default: Apply to all other identifiers (variables, functions, classes, etc.).
            // Enforcing camelCase and PascalCase automatically rejects snake_case and UPPER_SNAKE_CASE.
            {
                format: [
                    "camelCase",
                    "PascalCase",
                ],
                leadingUnderscore:  "forbid",
                selector:           "default",
                trailingUnderscore: "forbid",
            },
        ],
        "typescript-eslint-js/no-array-constructor": ["error"],
        "typescript-eslint-js/no-inferrable-types":  ["error"],
        "typescript-eslint-js/no-magic-numbers":     [
            "error",
            {
                detectObjects: false,
                enforceConst:  true,
                ignore:        [
                    -1,
                    0,
                    1,
                    60,
                    1000,
                    24,
                    12,
                    300,
                ],
                ignoreArrayIndexes:            true,
                ignoreClassFieldInitialValues: false,
                ignoreDefaultValues:           false,
                ignoreEnums:                   false,
                ignoreNumericLiteralTypes:     true,
                ignoreReadonlyClassProperties: false,
                ignoreTypeIndexes:             true,
            },
        ],
        "typescript-eslint-js/no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        message: "Please use node-compatible APIs instead. Bun is known to be unstable. Using node compatible APIs is future-proof.",
                        name:    "bun",
                    },
                ],
            },
        ],
        "typescript-eslint-js/no-unnecessary-type-constraint": ["error"],
        "typescript-eslint-js/prefer-function-type":           ["error"],
        "typescript/array-type":                               "off",
        "typescript/ban-ts-comment":                           "off",
        "typescript/consistent-generic-constructors":          "off",
        "typescript/consistent-type-definitions":              "off",
        "typescript/no-unnecessary-type-constraint":           "off",
        "typescript/prefer-function-type":                     "off",
    },
} satisfies OxlintConfig
