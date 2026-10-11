import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// The @stylistic rules, run by oxlint from our vendored copy of @stylistic/eslint-plugin 5.10.0
// (packages/lint/vendor/stylistic, generated — see its README). This replaces ESLint as the
// TypeScript/JavaScript formatter. Options are exactly what the ESLint preset resolved to
// (`stylistic.configs.customize({ arrowParens, blockSpacing, braceStyle: "1tbs", indent: 4,
// quotes: "double" })` plus the overrides that used to live in `../index.ts`); parity with ESLint
// (diagnostics and byte-identical --fix output) is recorded in docs/oxlint-migration.md.
//
// oxlint applies one round of fixes per run (ESLint loops up to 10), and `oxlint --fix` exits 0
// even when its fixes leave new problems behind: use `oxlint-fix` (./fix.ts), which loops.
const stylisticPlugin = fileURLToPath(new URL("../../vendor/stylistic/index.js", import.meta.url))
const indentSize = 4

export const stylisticConfig = {
    jsPlugins: [
        {
            name:      "@stylistic",
            specifier: stylisticPlugin,
        },
    ],
    rules: {
        "@stylistic/array-bracket-newline": [
            "error",
            {
                multiline: true,
            },
        ],
        "@stylistic/array-bracket-spacing": [
            "error",
            "never",
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
        "@stylistic/arrow-parens": [
            "error",
            "always",
            {
                requireForBlockBody: true,
            },
        ],
        "@stylistic/arrow-spacing": [
            "error",
            {
                after:  true,
                before: true,
            },
        ],
        "@stylistic/block-spacing": [
            "error",
            "always",
        ],
        "@stylistic/brace-style": [
            "error",
            "1tbs",
            {
                allowSingleLine: true,
            },
        ],
        "@stylistic/comma-dangle": [
            "error",
            "always-multiline",
        ],
        "@stylistic/comma-spacing": [
            "error",
            {
                after:  true,
                before: false,
            },
        ],
        "@stylistic/comma-style": [
            "error",
            "last",
        ],
        "@stylistic/computed-property-spacing": [
            "error",
            "never",
            {
                enforceForClassMembers: true,
            },
        ],
        "@stylistic/curly-newline": [
            "error",
            {
                minElements: 1,
            },
        ],
        "@stylistic/dot-location": [
            "error",
            "property",
        ],
        "@stylistic/eol-last": [
            "error",
            "always",
        ],
        "@stylistic/function-call-argument-newline": [
            "error",
            "consistent",
        ],
        "@stylistic/generator-star-spacing": [
            "error",
            {
                after:  true,
                before: false,
            },
        ],
        "@stylistic/indent": [
            "error",
            indentSize,
            {
                ArrayExpression: 1,
                CallExpression:  {
                    arguments: 1,
                },
                flatTernaryExpressions: false,
                FunctionDeclaration:    {
                    body:       1,
                    parameters: 1,
                    returnType: 1,
                },
                FunctionExpression: {
                    body:       1,
                    parameters: 1,
                    returnType: 1,
                },
                ignoreComments: false,
                ignoredNodes:   [
                    "TSUnionType",
                    "TSIntersectionType",
                ],
                ImportDeclaration:        1,
                MemberExpression:         1,
                ObjectExpression:         1,
                offsetTernaryExpressions: true,
                outerIIFEBody:            1,
                SwitchCase:               1,
                tabLength:                4,
                VariableDeclarator:       1,
            },
        ],
        "@stylistic/indent-binary-ops": [
            "error",
            indentSize,
        ],
        "@stylistic/jsx-closing-bracket-location": [
            "error",
            {
                nonEmpty:    "after-props",
                selfClosing: "after-props",
            },
        ],
        "@stylistic/jsx-closing-tag-location": [
            "error",
            "tag-aligned",
        ],
        "@stylistic/jsx-curly-brace-presence": [
            "error",
            {
                children:          "never",
                propElementValues: "always",
                props:             "never",
            },
        ],
        "@stylistic/jsx-curly-newline": [
            "error",
            "consistent",
        ],
        "@stylistic/jsx-curly-spacing": [
            "error",
            "never",
        ],
        "@stylistic/jsx-equals-spacing": [
            "error",
            "never",
        ],
        "@stylistic/jsx-first-prop-new-line": [
            "error",
            "multiline-multiprop",
        ],
        "@stylistic/jsx-function-call-newline": [
            "error",
            "multiline",
        ],
        "@stylistic/jsx-indent-props": [
            "error",
            indentSize,
        ],
        "@stylistic/jsx-max-props-per-line": [
            "error",
            {
                maximum: 1,
                when:    "multiline",
            },
        ],
        "@stylistic/jsx-quotes": [
            "error",
            "prefer-double",
        ],
        "@stylistic/jsx-tag-spacing": [
            "error",
            {
                afterOpening:      "never",
                beforeClosing:     "never",
                beforeSelfClosing: "always",
                closingSlash:      "never",
            },
        ],
        "@stylistic/jsx-wrap-multilines": [
            "error",
            {
                arrow:         "parens-new-line",
                assignment:    "parens-new-line",
                condition:     "parens-new-line",
                declaration:   "parens-new-line",
                logical:       "parens-new-line",
                prop:          "parens-new-line",
                propertyValue: "parens-new-line",
                return:        "parens-new-line",
            },
        ],
        "@stylistic/key-spacing": [
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
        "@stylistic/keyword-spacing": [
            "error",
            {
                after:     true,
                before:    true,
                overrides: {},
            },
        ],
        "@stylistic/lines-between-class-members": [
            "error",
            "always",
            {
                exceptAfterOverload:   true,
                exceptAfterSingleLine: true,
            },
        ],
        "@stylistic/max-statements-per-line": [
            "error",
            {
                max: 1,
            },
        ],
        "@stylistic/member-delimiter-style": [
            "error",
            {
                multiline: {
                    delimiter:   "none",
                    requireLast: false,
                },
                multilineDetection: "brackets",
                overrides:          {
                    interface: {
                        multiline: {
                            delimiter:   "none",
                            requireLast: false,
                        },
                    },
                },
                singleline: {
                    delimiter:   "comma",
                    requireLast: false,
                },
            },
        ],
        "@stylistic/multiline-ternary": [
            "error",
            "always-multiline",
            {
                ignoreJSX: true,
            },
        ],
        "@stylistic/new-parens": [
            "error",
            "always",
        ],
        "@stylistic/newline-per-chained-call": [
            "error",
            {
                ignoreChainWithDepth: 2,
            },
        ],
        "@stylistic/no-extra-parens": [
            "error",
            "functions",
        ],
        "@stylistic/no-floating-decimal": "error",
        "@stylistic/no-mixed-operators":  [
            "error",
            {
                allowSamePrecedence: true,
                groups:              [
                    [
                        "==",
                        "!=",
                        "===",
                        "!==",
                        ">",
                        ">=",
                        "<",
                        "<=",
                    ],
                    [
                        "&&",
                        "||",
                    ],
                    [
                        "in",
                        "instanceof",
                    ],
                ],
            },
        ],
        "@stylistic/no-mixed-spaces-and-tabs": [
            "error",
            false,
        ],
        "@stylistic/no-multi-spaces": [
            "error",
            {
                exceptions: {
                    ImportAttribute:    true,
                    ImportDeclaration:  true,
                    Property:           true,
                    TSTypeAnnotation:   true,
                    VariableDeclarator: true,
                },
                ignoreEOLComments: false,
                includeTabs:       true,
            },
        ],
        "@stylistic/no-multiple-empty-lines": [
            "error",
            {
                max: 1,
            },
        ],
        "@stylistic/no-tabs": [
            "error",
            {
                allowIndentationTabs: false,
            },
        ],
        "@stylistic/no-trailing-spaces": [
            "error",
            {
                ignoreComments: false,
                skipBlankLines: false,
            },
        ],
        "@stylistic/no-whitespace-before-property": "error",
        "@stylistic/object-curly-newline":          [
            "error",
            {
                consistent:    true,
                minProperties: 3,
                multiline:     true,
            },
        ],
        "@stylistic/object-curly-spacing": [
            "error",
            "always",
        ],
        "@stylistic/object-property-newline": [
            "error",
            {
                allowAllPropertiesOnSameLine: true,
            },
        ],
        "@stylistic/operator-linebreak": [
            "error",
            "before",
        ],
        "@stylistic/padded-blocks": [
            "error",
            {
                blocks:   "never",
                classes:  "never",
                switches: "never",
            },
            {
                allowSingleLineBlocks: false,
            },
        ],
        "@stylistic/quote-props": [
            "error",
            "consistent-as-needed",
        ],
        "@stylistic/quotes": [
            "error",
            "double",
            {
                allowTemplateLiterals: "always",
                avoidEscape:           false,
                ignoreStringLiterals:  false,
            },
        ],
        "@stylistic/rest-spread-spacing": [
            "error",
            "never",
        ],
        "@stylistic/semi": [
            "error",
            "never",
        ],
        "@stylistic/semi-spacing": [
            "error",
            {
                after:  true,
                before: false,
            },
        ],
        "@stylistic/space-before-blocks": [
            "error",
            "always",
        ],
        "@stylistic/space-before-function-paren": [
            "error",
            {
                anonymous:  "always",
                asyncArrow: "always",
                named:      "never",
            },
        ],
        "@stylistic/space-in-parens": [
            "error",
            "never",
        ],
        "@stylistic/space-infix-ops": [
            "error",
            {
                ignoreTypes: false,
                int32Hint:   false,
            },
        ],
        "@stylistic/space-unary-ops": [
            "error",
            {
                nonwords: false,
                words:    true,
            },
        ],
        "@stylistic/spaced-comment": [
            "error",
            "always",
            {
                block: {
                    balanced:   true,
                    exceptions: ["*"],
                    markers:    ["!"],
                },
                line: {
                    exceptions: [
                        "/",
                        "#",
                    ],
                    markers: ["/"],
                },
            },
        ],
        "@stylistic/template-curly-spacing": [
            "error",
            "never",
        ],
        "@stylistic/template-tag-spacing": [
            "error",
            "never",
        ],
        "@stylistic/type-annotation-spacing": [
            "error",
            {},
        ],
        "@stylistic/type-generic-spacing":     "error",
        "@stylistic/type-named-tuple-spacing": "error",
        "@stylistic/wrap-iife":                [
            "error",
            "any",
            {
                functionPrototypeMethods: true,
            },
        ],
        "@stylistic/yield-star-spacing": [
            "error",
            {
                after:  true,
                before: false,
            },
        ],
    },
} satisfies OxlintConfig
