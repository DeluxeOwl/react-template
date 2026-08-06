
import { preferStateClassRule } from "./prefer-state-class"
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx"
import { preferDiscriminatedUnionRule } from "./discriminated-union"
import { requireJSXReturnTypeRule } from "./require-jsx-return-type"
import { enforceNamespaceImportRule } from "./enforce-namespace-import"
import { noProviderWithStaticChildrenRule } from "./no-provider-with-static-children"

export default {
    rules: {
        "enforce-namespace-import":         enforceNamespaceImportRule,
        "no-margin-on-root-jsx":            noMarginOnRootJSXRule,
        "no-provider-with-static-children": noProviderWithStaticChildrenRule,
        "prefer-discriminated-union":       preferDiscriminatedUnionRule,
        "prefer-state-class":               preferStateClassRule,
        "require-jsx-return-type":          requireJSXReturnTypeRule,
    },
} as unknown
