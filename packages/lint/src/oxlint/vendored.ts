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
    "jsx-a11y/anchor-has-content":             "off",
    "jsx-a11y/click-events-have-key-events":   "off",
    "jsx-a11y/label-has-associated-control":   "off",
    "jsx-a11y/prefer-tag-over-role":           "off",
    "max-params":                              "off",
    "no-nested-ternary":                       "off",
    "no-underscore-dangle":                    "off",
    "no-unused-expressions":                   "off",
    "react/hook-use-state":                    "off",
    "react/jsx-no-constructed-context-values": "off",
    "react/jsx-props-no-spreading":            "off",
    "react/no-array-index-key":                "off",
    "react/no-danger":                         "off",
    "unicorn/explicit-length-check":           "off",
    "unicorn/no-document-cookie":              "off",
} satisfies DummyRuleMap
