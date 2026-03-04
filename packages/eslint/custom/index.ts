
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx"
import { preferDiscriminatedUnionRule } from "./discriminated-union"
import { enforceNamespaceImportRule } from "./enforce-namespace-import"

export default {
    meta: {
        name:    "eslint-plugin-sweepit",
        version: "0.0.0",
    },
    rules: {
        "enforce-namespace-import":   enforceNamespaceImportRule,
        "no-margin-on-root-jsx":      noMarginOnRootJSXRule,
        "prefer-discriminated-union": preferDiscriminatedUnionRule,
    },
} as unknown
