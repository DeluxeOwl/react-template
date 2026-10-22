import { definePlugin } from "@oxlint/plugins"

import { preferStateClassRule } from "./prefer-state-class.ts"
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx.ts"
import { requireJSXReturnTypeRule } from "./require-jsx-return-type.ts"
import { noBareEnableDirectiveRule } from "./no-bare-enable-directive.ts"
import { enforceNamespaceImportRule } from "./enforce-namespace-import.ts"
import { noProviderWithStaticChildrenRule } from "./no-provider-with-static-children.ts"
import { useAbortControllerForMultipleListenersRule } from "./use-abort-controller-for-multiple-listeners.ts"
import {
    noLoopsInComponentRule,
    noFilterInComponentRule,
    noSwitchInComponentRule,
    noLogicInMapCallbackRule,
    noArrayMethodsInComponentRule,
    noBuiltinHooksInComponentRule,
    noObjectSpreadInComponentRule,
    noMultipleHooksInComponentRule,
    noLogicExpressionsInComponentRule,
    noTernaryAssignmentInComponentRule,
} from "./view-only-rules.ts"

// Our own rules, as an oxlint JS plugin (alias `custom`). They are written for oxlint's plugin API,
// so unlike the vendored ESLint plugins they don't go through vendor/_compat.
export default definePlugin({
    meta:  { name: "custom" },
    rules: {
        "enforce-namespace-import":                    enforceNamespaceImportRule,
        "no-array-methods-in-component":               noArrayMethodsInComponentRule,
        "no-bare-enable-directive":                    noBareEnableDirectiveRule,
        "no-builtin-hooks-in-component":               noBuiltinHooksInComponentRule,
        "no-filter-in-component":                      noFilterInComponentRule,
        "no-logic-expressions-in-component":           noLogicExpressionsInComponentRule,
        "no-logic-in-map-callback":                    noLogicInMapCallbackRule,
        "no-loops-in-component":                       noLoopsInComponentRule,
        "no-margin-on-root-jsx":                       noMarginOnRootJSXRule,
        "no-multiple-hooks-in-component":              noMultipleHooksInComponentRule,
        "no-object-spread-in-component":               noObjectSpreadInComponentRule,
        "no-provider-with-static-children":            noProviderWithStaticChildrenRule,
        "no-switch-in-component":                      noSwitchInComponentRule,
        "no-ternary-assignment-in-component":          noTernaryAssignmentInComponentRule,
        "prefer-state-class":                          preferStateClassRule,
        "require-jsx-return-type":                     requireJSXReturnTypeRule,
        "use-abort-controller-for-multiple-listeners": useAbortControllerForMultipleListenersRule,
    },
})
