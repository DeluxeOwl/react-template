
// @ts-check

import tseslint from "typescript-eslint"
import oxlint from "eslint-plugin-oxlint"
import stylistic from "@stylistic/eslint-plugin"
import { importX } from "eslint-plugin-import-x"
import importZod from "eslint-plugin-import-zod"
import perfectionist from "eslint-plugin-perfectionist"
import unusedImports from "eslint-plugin-unused-imports"
import {
    type Config,
    defineConfig,
} from "eslint/config"
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript"

import { preferDiscriminatedUnionRule } from "./custom/discriminated-union"

// Using eslint for some rules that aren't available in oxlint
export default function createConfig(rootDir: string): Config[] {
    return defineConfig([
        {
            ignores: [
                "dist/**",
                "**/*.gen.ts",
                ".vscode/**",
                ".oxlintrc.json",
                "build/**",
                ".next/**",
                "out/**",
                "coverage/**",
                "app/globals.css",
                "node_modules/**",
                "messages/**",
                "public/**",
            ],
        },
        {
            extends: [
                tseslint.configs.recommendedTypeChecked,
                perfectionist.configs["recommended-natural"],
                stylistic.configs.customize({
                    arrowParens:  true,
                    blockSpacing: true,
                    braceStyle:   "1tbs",
                    indent:       4,
                    quotes:       "double",
                }),
                importZod.configs.recommended,
                // NOTE: Needs to be last
                ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
            ],
            files: ["**/*.{mjs,js,jsx,ts,tsx}"],

            languageOptions: {
                parser:        tseslint.parser,
                parserOptions: {
                    projectService: {
                        // Extra files for the linting
                        allowDefaultProject: ["*.d.ts"],
                        tsconfigRootDir:     rootDir,
                    },
                },
            },

            plugins: {
                "@typescript-eslint": tseslint.plugin,
                "custom":             {
                    rules: {
                        "prefer-discriminated-union": preferDiscriminatedUnionRule,
                    },
                },
                "unused-imports": unusedImports,
            },

            rules: {
                // "@stylistic/max-len": ["error", { code: 80 }], this doesnt work https://github.com/eslint-stylistic/eslint-stylistic/issues/686
                "@stylistic/array-bracket-newline": [
                    "error",
                    {
                        multiline: true,
                    },
                ],
                "@stylistic/array-element-newline": [
                    "error",
                    {
                        ArrayExpression: "consistent",
                        ArrayPattern:    {
                            minItems: 3,
                        },
                    },
                ],
                "@stylistic/curly-newline": [
                    "error", {
                        minElements: 1,
                    },
                ],
                "@stylistic/function-call-argument-newline": ["error", "consistent"],
                "@stylistic/jsx-closing-bracket-location":   [
                    "error",
                    {
                        nonEmpty:    "after-props",
                        selfClosing: "after-props",
                    },
                ],
                "@stylistic/jsx-max-props-per-line": [
                    "error",
                    {
                        maximum: 1,
                        when:    "multiline",
                    },
                ],
                "@stylistic/jsx-one-expression-per-line": "off",
                "@stylistic/key-spacing":                 [
                    "error",
                    {
                        align: {
                            afterColon:  true,
                            beforeColon: false,
                            on:          "value",
                        },
                        mode: "strict",
                    },
                ],
                "@stylistic/multiline-ternary": [
                    "error", "always-multiline", {
                        ignoreJSX: true,
                    },
                ],
                "@stylistic/no-multi-spaces": [
                    "error",
                    {
                        exceptions: {
                            ImportDeclaration:  true,
                            TSTypeAnnotation:   true,
                            VariableDeclarator: true,
                        },
                    },
                ],
                "@stylistic/no-multiple-empty-lines": [
                    "error",
                    {
                        max: 1,
                    },
                ],
                "@stylistic/object-curly-newline": [
                    "error",
                    {
                        consistent: true,
                        multiline:  true,
                    },
                ],
                "@stylistic/object-property-newline":                 ["error", { allowAllPropertiesOnSameLine: true }],
                "@stylistic/operator-linebreak":                      ["error"],
                "@typescript-eslint/array-type":                      "error",
                "@typescript-eslint/consistent-generic-constructors": "error",
                "@typescript-eslint/consistent-indexed-object-style": "error",
                "@typescript-eslint/consistent-type-definitions":     ["error", "interface"],
                "@typescript-eslint/consistent-type-exports":         "error",
                "@typescript-eslint/explicit-function-return-type":   ["error", { allowExpressions: true, allowIIFEs: true }],
                // For ordering classes and such, conflicts with perfectionist/sort-interfaces
                // Could maybe configure it for classes
                "@typescript-eslint/member-ordering":                 [
                    "off",
                    { default: ["signature", "method", "constructor", "field"] },
                ],
                // Naming conventions
                "@typescript-eslint/naming-convention": [
                    "off",
                    { format: ["camelCase"], selector: "variableLike" },
                ],
                "@typescript-eslint/no-confusing-void-expression": "error",
                "@typescript-eslint/no-deprecated":                "error",
                // These 2 are handled by oxlint.
                "@typescript-eslint/no-explicit-any":              ["off"],
                "@typescript-eslint/no-inferrable-types":          "error",
                // 0 and 1 are common enough during ifs, arrays etc.
                "@typescript-eslint/no-magic-numbers":             [
                    "error", {
                        enforceConst:              true,
                        ignore:                    [0, 1],
                        ignoreArrayIndexes:        true,
                        ignoreNumericLiteralTypes: true,
                        ignoreTypeIndexes:         true,
                    },
                ],
                "@typescript-eslint/no-require-imports":              ["off"],
                "@typescript-eslint/no-unused-vars":                  "off",
                // This is not bad but really, it will confuse the LLMs
                "@typescript-eslint/prefer-readonly-parameter-types": "off",
                "custom/prefer-discriminated-union":                  "warn",
                "no-var":                                             "error",
                "perfectionist/sort-imports":                         [
                    "error",
                    {
                        fallbackSort: {
                            order: "asc",
                            type:  "alphabetical",
                        },
                        type: "line-length",
                    },
                ],
                "perfectionist/sort-interfaces": [
                    "error",
                    {
                        fallbackSort: {
                            order: "asc",
                            type:  "alphabetical",
                        },
                        type: "line-length",
                    },
                ],
                "perfectionist/sort-modules": [
                    "off",
                    {
                        fallbackSort: {
                            order: "asc",
                            type:  "alphabetical",
                        },
                        type: "line-length",
                    },
                ],
                "perfectionist/sort-named-imports": [
                    "error",
                    {
                        fallbackSort: {
                            order: "asc",
                            type:  "alphabetical",
                        },
                        type: "line-length",
                    },
                ],
                "unused-imports/no-unused-imports": "error",

                "unused-imports/no-unused-vars": [
                    "warn",
                    {
                        args:              "after-used",
                        argsIgnorePattern: "^_",
                        vars:              "all",
                        varsIgnorePattern: "^_",
                    },
                ],
            },
        },
        {
            extends: ["import-x/flat/recommended"],
            plugins: {
                // @ts-expect-error https://github.com/typescript-eslint/typescript-eslint/issues/11543 and https://github.com/un-ts/eslint-plugin-import-x/issues/421
                "import-x": importX,
            },
            rules: {
                "import-x/no-dynamic-require": "warn",
            },
            settings: {
                "import-x/resolver-next": [
                    createTypeScriptImportResolver({
                        alwaysTryTypes: true,
                        bun:            true,
                        project:        rootDir,
                    }),
                ],
            },
        },
    ])
}
