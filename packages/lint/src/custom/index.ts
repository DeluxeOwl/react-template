
import { preferStateClassRule } from "./prefer-state-class"
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx"
import { preferDiscriminatedUnionRule } from "./discriminated-union"
import { enforceNamespaceImportRule } from "./enforce-namespace-import"

export default {
    rules: {
        "enforce-namespace-import":   enforceNamespaceImportRule,
        "no-margin-on-root-jsx":      noMarginOnRootJSXRule,
        "prefer-discriminated-union": preferDiscriminatedUnionRule,
        "prefer-state-class":         preferStateClassRule,
    },
} as unknown
