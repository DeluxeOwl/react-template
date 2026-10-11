import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// ESLint's own core rules run by oxlint from our vendored copy of eslint 10.3.0
// (packages/lint/vendor/eslint, generated — see its README), under the alias `eslint-js` (oxlint
// reserves `eslint` for its native rules). Options are exactly what the ESLint preset resolved to;
// parity with ESLint (diagnostics and byte-identical --fix output) is recorded in
// docs/oxlint-migration.md. oxlint's native versions of three of them differ in spans and fixes
// (native no-var writes `const` where ESLint writes `let`), so they are turned off here.
const eslintPlugin = fileURLToPath(new URL("../../vendor/eslint/index.js", import.meta.url))

export const eslintCoreConfig = {
    jsPlugins: [
        {
            name:      "eslint-js",
            specifier: eslintPlugin,
        },
    ],
    rules: {
        "eslint-js/no-restricted-globals": [
            "error",
            {
                message: "Do not use Bun global APIs unless 100% necessary. Prefer node-js compatible APIs or other libs.",
                name:    "Bun",
            },
        ],
        "eslint-js/no-restricted-syntax": [
            "warn",
            {
                message:  "Consider using `all` from 'better-all' to automatically optimize task dependencies and parallelization.",
                selector: "CallExpression[callee.object.name='Promise'][callee.property.name='all']",
            },
            {
                message:  "Consider using `allSettled` from 'better-all' to maintain dependency logic while handling task failures.",
                selector: "CallExpression[callee.object.name='Promise'][callee.property.name='allSettled']",
            },
            {
                message:  "Consider using `flow` from 'better-all'. It allows for more complex racing logic and conditional early exits using `this.$end()`.",
                selector: "CallExpression[callee.object.name='Promise'][callee.property.name='race']",
            },
            {
                message:  "Consider using `flow` from 'better-all' to explicitly control the 'winning' criteria of your async tasks.",
                selector: "CallExpression[callee.object.name='Promise'][callee.property.name='any']",
            },
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
        "eslint-js/no-throw-literal": ["error"],
        "eslint-js/no-var":           ["error"],
        "eslint-js/prefer-const":     [
            "error",
            {
                destructuring:          "any",
                ignoreReadBeforeAssign: false,
            },
        ],
        "eslint/no-throw-literal": "off",
        "eslint/no-var":           "off",
        "eslint/prefer-const":     "off",
    },
} satisfies OxlintConfig
