import type { ESTree, SourceCode } from "@oxlint/plugins"

/*
 * The view-only and AbortController rules were ast-grep rules until @deluxeowl/lint 0.5.0. Their
 * call patterns, such as `useState($$$)` and `$ARR.filter($$$)`, matched a call only in its plain
 * form. These helpers keep that, so the rules flag the same calls as before:
 *
 *   xs?.filter(f)          no: optional chaining (also `useState?.(0)`)
 *   useState<number>(0)    no: type arguments
 *   (useState)(0)          no: parentheses around the callee
 *   xs // why
 *       .filter(f)         no: a comment between the callee's parts or before the `(`
 *   xs.filter(/* c *\/ f)  yes: comments among the arguments don't matter
 */

function isPlainCall(node: ESTree.CallExpression, sourceCode: SourceCode): boolean {
    const hasTypeArguments = (node.typeArguments ?? null) !== null

    if (node.optional || hasTypeArguments || node.range[0] !== node.callee.range[0]) {
        return false
    }
    const head = node.callee.type === "MemberExpression" ? node.callee.object : node.callee
    const openParen = sourceCode.getTokenAfter(node.callee)

    return openParen === null || !sourceCode.commentsExistBetween(head, openParen)
}

/** `name(…)` gives `name`, when the call is plain. */
export function getPlainFunctionCallName(node: ESTree.CallExpression, sourceCode: SourceCode): null | string {
    return node.callee.type === "Identifier" && isPlainCall(node, sourceCode) ? node.callee.name : null
}

/** `object.name(…)` gives `name`, when the call is plain. */
export function getPlainMethodCallName(node: ESTree.CallExpression, sourceCode: SourceCode): null | string {
    const { callee } = node

    if (callee.type !== "MemberExpression" || callee.computed || callee.optional || callee.property.type !== "Identifier") {
        return null
    }
    return isPlainCall(node, sourceCode) ? callee.property.name : null
}
