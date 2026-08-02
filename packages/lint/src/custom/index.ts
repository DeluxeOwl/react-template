
import { preferStateClassRule } from "./prefer-state-class"
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx"
import { requireJSXReturnTypeRule } from "./require-jsx-return-type"
import { preferDiscriminatedUnionRule } from "./discriminated-union"
import { enforceNamespaceImportRule } from "./enforce-namespace-import"

export default {
    rules: {
        "enforce-namespace-import":   enforceNamespaceImportRule,
        "no-margin-on-root-jsx":      noMarginOnRootJSXRule,
        "prefer-discriminated-union": preferDiscriminatedUnionRule,
        "prefer-state-class":         preferStateClassRule,
        "require-jsx-return-type":    requireJSXReturnTypeRule,
    },
} as unknown
