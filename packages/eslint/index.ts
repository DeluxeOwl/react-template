
// @ts-check

import tseslint from "typescript-eslint"
import oxlint from "eslint-plugin-oxlint"
import vitest from "@vitest/eslint-plugin"
import sweepit from "eslint-plugin-sweepit"
import stylistic from "@stylistic/eslint-plugin"
import { importX } from "eslint-plugin-import-x"
import importZod from "eslint-plugin-import-zod"
import gitignore from "eslint-config-flat-gitignore"
import perfectionist from "eslint-plugin-perfectionist"
import eslintPluginUnicorn from "eslint-plugin-unicorn"
import unusedImports from "eslint-plugin-unused-imports"
import {
    type Config,
    defineConfig,
} from "eslint/config"
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript"

import customPlugin from "./custom"

// bun run eslint --inspect-config

// Using eslint for some rules that aren't available in oxlint
// oxlint-disable-next-line max-lines-per-function
export default function createConfig(rootDir: string, allowDefaultProject: string[] = []): Config[] {
    return defineConfig([
        gitignore(),
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
                        allowDefaultProject: ["*.d.ts", ...allowDefaultProject],
                    },
                    tsconfigRootDir: rootDir,
                },
            },

            plugins: {
                "@typescript-eslint": tseslint.plugin,
                // @ts-expect-error This is an issue with @typescript-eslint/utils.
                "custom":             customPlugin,
                "sweepit":            sweepit,
                "unicorn":            eslintPluginUnicorn,
                "unused-imports":     unusedImports,
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
                "@typescript-eslint/consistent-type-imports":         ["error", { fixStyle: "inline-type-imports" }],
                "@typescript-eslint/explicit-function-return-type":   ["error", { allowExpressions: true, allowIIFEs: true }],
                // For ordering classes and such, conflicts with perfectionist/sort-interfaces
                // Could maybe configure it for classes
                "@typescript-eslint/member-ordering":                 [
                    "off",
                    { default: ["signature", "method", "constructor", "field"] },
                ],
                "@typescript-eslint/method-signature-style": ["error", "property"],
                // Naming conventions
                // NOTE: I would like Go's naming conventions, like PascalCase anywhere, or at least for exports.
                // But I've decided against it. It would confuse the AI a lot or create an additional format step.
                // Typescript already has the `export` keyword.
                "@typescript-eslint/naming-convention":      [
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
                    // 4. Global Default: Apply to all other identifiers (variables, functions, classes, etc.).
                    // Enforcing camelCase and PascalCase automatically rejects snake_case and UPPER_SNAKE_CASE.
                    {
                        format:             ["camelCase", "PascalCase"],
                        leadingUnderscore:  "forbid",
                        selector:           "default",
                        trailingUnderscore: "forbid",
                    },
                ],
                "@typescript-eslint/no-confusing-void-expression": "error",
                "@typescript-eslint/no-deprecated":                "error",
                // These 2 are handled by oxlint.
                "@typescript-eslint/no-explicit-any":              ["off"],
                "@typescript-eslint/no-inferrable-types":          "error",
                "@typescript-eslint/no-magic-numbers":             [
                    "error", {
                        enforceConst:              true,
                        ignore:                    [-1, 0, 1, 60, 1000, 24, 12, 300],
                        ignoreArrayIndexes:        true,
                        ignoreNumericLiteralTypes: true,
                        ignoreTypeIndexes:         true,
                    },
                ],
                "@typescript-eslint/no-require-imports":    ["off"],
                // Related to restricted imports
                "@typescript-eslint/no-restricted-imports": [
                    "error", {
                        paths: [
                            {
                                message: "Please use node-compatible APIs instead. Bun is known to be unstable. Using node compatible APIs is future-proof.",
                                name:    "bun",
                            },
                        ],
                    },
                ],
                // Related to restricted types
                "@typescript-eslint/no-restricted-types":                    ["off"],
                "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
                "@typescript-eslint/no-unnecessary-condition":               "error",
                "@typescript-eslint/no-unnecessary-template-expression":     "error",
                "@typescript-eslint/no-unnecessary-type-conversion":         "error",
                "@typescript-eslint/no-unsafe-type-assertion":               "error",
                "@typescript-eslint/no-unused-vars":                         "off",
                "@typescript-eslint/no-useless-default-assignment":          "error",
                "@typescript-eslint/prefer-function-type":                   "error",
                // This is not bad but really, it will confuse the LLMs
                "@typescript-eslint/prefer-readonly-parameter-types":        "off",
                "@typescript-eslint/prefer-string-starts-ends-with":         "error",
                "@typescript-eslint/unified-signatures":                     "error",
                "custom/enforce-namespace-import":                           ["error", { packages: ["@react-template/domain", "errore"] }],
                "custom/no-margin-on-root-jsx":                              "error",
                "custom/prefer-discriminated-union":                         "warn",
                "custom/prefer-state-class":                                 "error",
                // 0 and 1 are common enough during ifs, arrays etc.
                "no-magic-numbers":                                          ["off"],
                "no-restricted-globals":                                     [
                    "error",
                    {
                        message: "Do not use Bun global APIs unless 100% necessary. Prefer node-js compatible APIs or other libs.",
                        name:    "Bun",
                    },
                ],
                "no-restricted-imports": "off",
                "no-restricted-syntax":  [
                    "warn",
                    {
                        message:  "Public constructors are not allowed. Use private or protected instead.",
                        selector: "MethodDefinition[kind='constructor'][accessibility!='private'][accessibility!='protected']",
                    },
                    {
                        message:  "Usage of private class members (#) is not allowed. Use `private` instead.",
                        selector: "PrivateIdentifier",
                    },
                    {
                        message:  "Do not use 'Promise.reject()'. Return a custom error object instead.",
                        selector: "CallExpression[callee.object.name='Promise'][callee.property.name='reject']",
                    },
                    {
                        message:  "Do not use 'throw'. Use a return object or a custom error handling function instead.",
                        selector: "ThrowStatement",
                    },
                    {
                        message:  "Specify a reason after '--' when disabling ESLint rules.",
                        selector: "Program > LineComment[value=/(eslint|oxlint)-disable/]:not([value=/--/])",
                    },
                    {
                        message:  "Specify a reason after '--' when disabling ESLint rules.",
                        selector: "Program > BlockComment[value=/(eslint|oxlint)-disable/]:not([value=/--/])",
                    },
                    {
                        message:  "Generic handler names (like 'handleClick' or 'onDelete') are forbidden. Please be specific about WHAT is being handled, e.g., 'handleUserDelete' or 'onEmailSubmit'.",
                        // This selector looks for variable names and function names
                        selector: "VariableDeclarator > Identifier[name=/^(handleClick|onClick|handleSubmit|onSubmit|handleEvent|onEvent|handleChange|onChange|handleDelete|onDelete|handleSelect|onSelect)$/], FunctionDeclaration > Identifier[name=/^(handleClick|onClick|handleSubmit|onSubmit|handleEvent|onEvent|handleChange|onChange|handleDelete|onDelete|handleSelect|onSelect)$/]",
                    },
                    {
                        message:  "Prefer useSuspenseQuery or useSuspenseQueries with Suspense and ErrorBoundary.",
                        selector: "CallExpression > Identifier[name=/^(useQuery|useQueries)$/]",
                    },
                    {
                        message:  "IIFEs inside JSX are forbidden. Extract logic to a variable or a sub-component.",
                        // Targets: {(() => { ... })()} and { (function() { ... })() }
                        selector: "JSXExpressionContainer > CallExpression[callee.type='ArrowFunctionExpression'], JSXExpressionContainer > CallExpression[callee.type='FunctionExpression']",
                    },
                    {
                        message:  "Do not use 'instanceof Error'. Use 'Error.isError()' instead to ensure cross-realm compatibility and safer type narrowing.",
                        selector: "BinaryExpression[operator='instanceof'][right.name='Error']",
                    },
                ],
                "no-var":                            "error",
                "perfectionist/sort-array-includes": [
                    "error",
                    {
                        fallbackSort: {
                            order: "asc",
                            type:  "alphabetical",
                        },
                        type: "line-length",
                    },
                ],
                "perfectionist/sort-exports": [
                    "error",
                    {
                        fallbackSort: {
                            order: "asc",
                            type:  "alphabetical",
                        },
                        type: "line-length",
                    },
                ],
                "perfectionist/sort-heritage-clauses": [
                    "error",
                    {
                        fallbackSort: {
                            order: "asc",
                            type:  "alphabetical",
                        },
                        type: "line-length",
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
                "perfectionist/sort-maps": [
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
                "perfectionist/sort-sets": [
                    "error",
                    {
                        fallbackSort: {
                            order: "asc",
                            type:  "alphabetical",
                        },
                        type: "line-length",
                    },
                ],
                "sweepit/complexity":                  ["error", { max: 10, variant: "modified" }],
                "sweepit/no-return-object-repetition": "error",
                "unicorn/better-regex":                "error",
                "unicorn/consistent-destructuring":    "error",
                "unicorn/expiring-todo-comments":      ["error", { allowWarningComments: false }],
                // This rule isn't supported in oxlint.
                "unicorn/import-style":                [
                    "error",
                    {
                        styles: {
                            "@react-template/domain": {
                                named:     false,
                                namespace: true,
                            },
                        },
                    },
                ],

                "unused-imports/no-unused-imports": "error",
                "unused-imports/no-unused-vars":    [
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
                        project:        [rootDir],
                    }),
                ],
            },
        },
        {
            files:   ["**/*.test.ts"], // or any other pattern
            plugins: {
                vitest,
            },
            rules: {
                ...vitest.configs.all.rules, // you can also use vitest.configs.all.rules to enable all rules
            },
            settings: {
                vitest: {
                    typecheck: true,
                },
            },
        },
    ])
}
