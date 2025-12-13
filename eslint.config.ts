// @ts-check

import globals from "globals"
import tseslint from "typescript-eslint"
import oxlint from "eslint-plugin-oxlint"
import stylistic from "@stylistic/eslint-plugin"
import {
    defineConfig,
} from "eslint/config"
import reactHooks from "eslint-plugin-react-hooks"
import eslintReact from "@eslint-react/eslint-plugin"
import perfectionist from "eslint-plugin-perfectionist"
import unusedImports from "eslint-plugin-unused-imports"
import eslintPluginReadableTailwind from "eslint-plugin-readable-tailwind"
import youMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect"

// Using eslint for some rules that aren't available in oxlint
// We don't use any tseslint rules, only the parser
export default defineConfig([
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
            reactHooks.configs.flat.recommended,
            tseslint.configs.recommended,
            eslintReact.configs["recommended-typescript"],
            perfectionist.configs["recommended-natural"],
            stylistic.configs.customize({
                arrowParens:  true,
                blockSpacing: true,
                braceStyle:   "1tbs",
                indent:       4,
                quotes:       "double",
            }),
            youMightNotNeedAnEffect.configs.recommended,
            // NOTE: Needs to be last
            ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
        ],
        files: ["**/*.{mjs,js,jsx,ts,tsx}"],

        languageOptions: {
            ecmaVersion: 2020,
            globals:     globals.browser,
            parser:      tseslint.parser,
        },

        plugins: {
            "@typescript-eslint": tseslint.plugin,
            "readable-tailwind":  eslintPluginReadableTailwind,
            "unused-imports":     unusedImports,
        },

        rules: {
            "@stylistic/curly-newline": [
                "error", {
                    minElements: 1,
                },
            ],
            "@stylistic/jsx-closing-bracket-location": [
                "error",
                {
                    nonEmpty:    "after-props",
                    selfClosing: "after-props",
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
            "@stylistic/object-property-newline":    ["error"],
            "@stylistic/operator-linebreak":         ["error"],
            "@typescript-eslint/no-explicit-any":    ["off"], // Handled by oxlint
            "@typescript-eslint/no-require-imports": ["off"], // Handled by oxlint
            "@typescript-eslint/no-unused-vars":     "off",
            "unused-imports/no-unused-imports":      "error",
            "unused-imports/no-unused-vars":         [
                "warn",
                {
                    args:              "after-used",
                    argsIgnorePattern: "^_",
                    vars:              "all",
                    varsIgnorePattern: "^_",
                },
            ],
            ...eslintPluginReadableTailwind.configs.warning.rules,
            ...eslintPluginReadableTailwind.configs.error.rules,
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
            "@stylistic/function-call-argument-newline": ["error", "consistent"],
            "@stylistic/jsx-max-props-per-line":         [
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
            "perfectionist/sort-imports": [
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
            "readable-tailwind/multiline": ["off"],
        },
    },
])
