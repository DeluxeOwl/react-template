
import { preferStateClassRule } from "./prefer-state-class.ts"
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx.ts"
import { preferDiscriminatedUnionRule } from "./discriminated-union.ts"
import { requireJSXReturnTypeRule } from "./require-jsx-return-type.ts"
import { enforceNamespaceImportRule } from "./enforce-namespace-import.ts"
import { noProviderWithStaticChildrenRule } from "./no-provider-with-static-children.ts"

export const customRules: Record<string, unknown> = {
    "enforce-namespace-import":         enforceNamespaceImportRule,
    "no-margin-on-root-jsx":            noMarginOnRootJSXRule,
    "no-provider-with-static-children": noProviderWithStaticChildrenRule,
    "prefer-discriminated-union":       preferDiscriminatedUnionRule,
    "prefer-state-class":               preferStateClassRule,
    "require-jsx-return-type":          requireJSXReturnTypeRule,
}
