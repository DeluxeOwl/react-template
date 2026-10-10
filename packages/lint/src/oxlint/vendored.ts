import type { DummyRuleMap } from "oxlint"

// Standard directories for generated/vendored UI code (shadcn, ReUI).
// Ported 1:1 from the former `packages/lint/oxlint/react-vendored.json` (oxlint 1.62).
export const defaultVendoredFiles = [
    "**/components/ui/**",
    "**/components/reui/**",
    "**/components/hooks/**",
    "**/components/examples/**",
    "**/ui/hooks/**",
]

// Rules relaxed for vendored code. Type-safety and return-type rules stay enabled.
export const vendoredRules = {
    "@eslint-react/dom-no-dangerously-set-innerhtml":            "off",
    "@eslint-react/no-array-index-key":                          "off",
    "@eslint-react/no-context-provider":                         "off",
    "@eslint-react/no-nested-component-definitions":             "off",
    "@eslint-react/set-state-in-effect":                         "off",
    "@eslint-react/use-state":                                   "off",
    "custom/no-margin-on-root-jsx":                              "off",
    "custom/prefer-discriminated-union":                         "off",
    "eslint-js/no-restricted-syntax":                            "off",
    "jsx-a11y/anchor-has-content":                               "off",
    "jsx-a11y/click-events-have-key-events":                     "off",
    "jsx-a11y/label-has-associated-control":                     "off",
    "jsx-a11y/prefer-tag-over-role":                             "off",
    "max-params":                                                "off",
    "no-nested-ternary":                                         "off",
    "no-underscore-dangle":                                      "off",
    "no-unused-expressions":                                     "off",
    "react-hooks-js/set-state-in-effect":                        "off",
    "react-hooks-js/todo":                                       "off",
    "react-you-might-not-need-an-effect/no-event-handler":       "off",
    "react-you-might-not-need-an-effect/no-initialize-state":    "off",
    "react-you-might-not-need-an-effect/no-pass-data-to-parent": "off",
    "react/hook-use-state":                                      "off",
    "react/jsx-no-constructed-context-values":                   "off",
    "react/jsx-props-no-spreading":                              "off",
    "react/no-array-index-key":                                  "off",
    "react/no-danger":                                           "off",
    "sweepit/complexity":                                        "off",
    "sweepit/jsx-bem-compound-naming":                           "off",
    "sweepit/no-boolean-capability-props":                       "off",
    "sweepit/no-prop-drilling":                                  "off",
    "unicorn/explicit-length-check":                             "off",
    "unicorn/no-document-cookie":                                "off",
} satisfies DummyRuleMap
