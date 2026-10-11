import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// @eslint-react rules run by oxlint from our vendored copy of @eslint-react/eslint-plugin 5.7.1
// (packages/lint/vendor/eslint-react, generated — see its README). oxlint has no native versions.
// Severities and settings are exactly what the ESLint preset (`recommended-typescript`) resolved
// to; parity with ESLint is recorded in docs/oxlint-migration.md. Four rules are not run:
// `no-leaked-conditional-rendering` needs the type checker (`typescript/strict-boolean-expressions`
// with numbers and strings disallowed covers it, see type-aware.ts), and the fixes of
// `dom-no-hydrate`, `dom-no-render` and `dom-no-use-form-state` can produce code that oxc rejects.
const eslintReactPlugin = fileURLToPath(new URL("../../vendor/eslint-react/index.js", import.meta.url))

export const eslintReactConfig = {
    jsPlugins: [
        {
            name:      "@eslint-react",
            specifier: eslintReactPlugin,
        },
    ],
    rules: {
        "@eslint-react/dom-no-dangerously-set-innerhtml":               ["warn"],
        "@eslint-react/dom-no-dangerously-set-innerhtml-with-children": ["error"],
        "@eslint-react/dom-no-find-dom-node":                           ["error"],
        "@eslint-react/dom-no-flush-sync":                              ["error"],
        "@eslint-react/dom-no-render-return-value":                     ["error"],
        "@eslint-react/dom-no-script-url":                              ["warn"],
        "@eslint-react/dom-no-unsafe-iframe-sandbox":                   ["warn"],
        "@eslint-react/dom-no-void-elements-with-children":             ["error"],
        "@eslint-react/error-boundaries":                               ["error"],
        "@eslint-react/exhaustive-deps":                                ["warn"],
        "@eslint-react/jsx-no-children-prop":                           ["warn"],
        "@eslint-react/jsx-no-children-prop-with-children":             ["error"],
        "@eslint-react/jsx-no-comment-textnodes":                       ["warn"],
        "@eslint-react/jsx-no-key-after-spread":                        ["error"],
        "@eslint-react/jsx-no-leaked-dollar":                           ["warn"],
        "@eslint-react/jsx-no-leaked-semicolon":                        ["warn"],
        "@eslint-react/jsx-no-namespace":                               ["error"],
        "@eslint-react/naming-convention-context-name":                 ["warn"],
        "@eslint-react/naming-convention-id-name":                      ["warn"],
        "@eslint-react/naming-convention-ref-name":                     ["warn"],
        "@eslint-react/no-access-state-in-setstate":                    ["error"],
        "@eslint-react/no-array-index-key":                             ["warn"],
        "@eslint-react/no-children-count":                              ["warn"],
        "@eslint-react/no-children-for-each":                           ["warn"],
        "@eslint-react/no-children-map":                                ["warn"],
        "@eslint-react/no-children-only":                               ["warn"],
        "@eslint-react/no-children-to-array":                           ["warn"],
        "@eslint-react/no-clone-element":                               ["warn"],
        "@eslint-react/no-component-will-mount":                        ["error"],
        "@eslint-react/no-component-will-receive-props":                ["error"],
        "@eslint-react/no-component-will-update":                       ["error"],
        "@eslint-react/no-context-provider":                            ["warn"],
        "@eslint-react/no-create-ref":                                  ["error"],
        "@eslint-react/no-direct-mutation-state":                       ["error"],
        "@eslint-react/no-forward-ref":                                 ["warn"],
        "@eslint-react/no-missing-key":                                 ["error"],
        "@eslint-react/no-nested-component-definitions":                ["error"],
        "@eslint-react/no-nested-lazy-component-declarations":          ["error"],
        "@eslint-react/no-set-state-in-component-did-mount":            ["warn"],
        "@eslint-react/no-set-state-in-component-did-update":           ["warn"],
        "@eslint-react/no-set-state-in-component-will-update":          ["warn"],
        "@eslint-react/no-unnecessary-use-prefix":                      ["warn"],
        "@eslint-react/no-unsafe-component-will-mount":                 ["warn"],
        "@eslint-react/no-unsafe-component-will-receive-props":         ["warn"],
        "@eslint-react/no-unsafe-component-will-update":                ["warn"],
        "@eslint-react/no-unused-class-component-members":              ["warn"],
        "@eslint-react/no-unused-state":                                ["warn"],
        "@eslint-react/no-use-context":                                 ["warn"],
        "@eslint-react/purity":                                         ["warn"],
        "@eslint-react/rsc-function-definition":                        ["error"],
        "@eslint-react/rules-of-hooks":                                 ["error"],
        "@eslint-react/set-state-in-effect":                            ["warn"],
        "@eslint-react/set-state-in-render":                            ["error"],
        "@eslint-react/static-components":                              ["error"],
        "@eslint-react/unsupported-syntax":                             ["error"],
        "@eslint-react/use-memo":                                       ["error"],
        "@eslint-react/use-state":                                      ["warn"],
        "@eslint-react/web-api-no-leaked-event-listener":               ["warn"],
        "@eslint-react/web-api-no-leaked-fetch":                        ["warn"],
        "@eslint-react/web-api-no-leaked-interval":                     ["warn"],
        "@eslint-react/web-api-no-leaked-resize-observer":              ["warn"],
        "@eslint-react/web-api-no-leaked-timeout":                      ["warn"],
    },
    settings: {
        "react-x": {
            importSource:        "react",
            polymorphicPropName: "as",
            version:             "detect",
        },
    },
} satisfies OxlintConfig
