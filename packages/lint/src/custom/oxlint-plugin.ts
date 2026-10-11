import { definePlugin } from "@oxlint/plugins"

import { preferStateClassRule } from "./prefer-state-class.ts"
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx.ts"
import { preferDiscriminatedUnionRule } from "./discriminated-union.ts"
import { requireJSXReturnTypeRule } from "./require-jsx-return-type.ts"
import { noBareEnableDirectiveRule } from "./no-bare-enable-directive.ts"
import { enforceNamespaceImportRule } from "./enforce-namespace-import.ts"
import { noProviderWithStaticChildrenRule } from "./no-provider-with-static-children.ts"

// Our own rules, as an oxlint JS plugin (alias `custom`). They are written for oxlint's plugin API,
// so unlike the vendored ESLint plugins they don't go through vendor/_compat.
export default definePlugin({
    meta:  { name: "custom" },
    rules: {
        "enforce-namespace-import":         enforceNamespaceImportRule,
        "no-bare-enable-directive":         noBareEnableDirectiveRule,
        "no-margin-on-root-jsx":            noMarginOnRootJSXRule,
        "no-provider-with-static-children": noProviderWithStaticChildrenRule,
        "prefer-discriminated-union":       preferDiscriminatedUnionRule,
        "prefer-state-class":               preferStateClassRule,
        "require-jsx-return-type":          requireJSXReturnTypeRule,
    },
})
