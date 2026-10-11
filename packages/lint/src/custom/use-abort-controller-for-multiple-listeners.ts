import {
    defineRule, type ESTree, type SourceCode,
} from "@oxlint/plugins"

import { getPlainMethodCallName, getPlainFunctionCallName } from "./plain-call.ts"

/*
 * ----------------------------------------------------------------------------
 * Rule: use-abort-controller-for-multiple-listeners
 * ----------------------------------------------------------------------------
 * Several listeners added in a `useEffect` are cleaner to remove with one
 * AbortController than with a removeEventListener call each:
 *
 *   useEffect(() => {
 *       const controller = new AbortController()
 *       window.addEventListener("scroll", onScroll, { signal: controller.signal })
 *       window.addEventListener("resize", onResize, { signal: controller.signal })
 *       return () => controller.abort()
 *   }, [])
 *
 * This was an ast-grep rule until @deluxeowl/lint 0.5.0
 * (`ast-grep/rules/abort-controller-rules.yml`) and flags what it flagged: a
 * statement with an `x.addEventListener(…)` call anywhere in it, inside a
 * `useEffect(…)` call, directly followed by another such statement. Of two
 * listener statements the first is reported, of three the first two. A
 * statement is fine when its call has three arguments with a `signal`
 * property among them (`{ signal }`, `{ ...options, signal }`).
 *
 * Not reported, as before:
 *   - a listener statement followed by another statement, or separated from
 *     the next one by a comment on its own line or after a `;` (tree-sitter
 *     kept such a comment as a node between the two statements);
 *   - calls that aren't plain (plain-call.ts): `el?.addEventListener(…)`;
 *     `React.useEffect(…)` and `useLayoutEffect(…)` are not `useEffect`.
 * ----------------------------------------------------------------------------
 */

// `$OBJ.addEventListener($A, $B, $OPTS)`: type, listener, options
const ArgumentsWithOptions = 3

function addStatementsAround(node: ESTree.Node, statements: Set<ESTree.ExpressionStatement>): void {
    for (let current = node.parent; current !== null; current = current.parent) {
        if (current.type === "ExpressionStatement") {
            statements.add(current)
        }
    }
}

/** `{ signal }` or `{ signal: … }` in an object literal (not a pattern, method or computed key). */
function isSignalOption(node: ESTree.AssignmentTargetProperty | ESTree.BindingProperty | ESTree.ObjectProperty): boolean {
    const isPlainProperty = node.parent.type === "ObjectExpression" && node.kind === "init" && !node.method && !node.computed

    return isPlainProperty && node.key.type === "Identifier" && node.key.name === "signal"
}

function isListenerCall(node: ESTree.Node, sourceCode: SourceCode): boolean {
    return node.type === "CallExpression" && getPlainMethodCallName(node, sourceCode) === "addEventListener"
}

/** The three-argument listener calls that have `signal` (a property) in them. */
function getListenerCallsAround(signal: ESTree.Node, sourceCode: SourceCode): ESTree.Node[] {
    const calls: ESTree.Node[] = []

    for (let current: ESTree.Node | null = signal.parent; current !== null; current = current.parent) {
        if (current.type === "CallExpression" && current.arguments.length === ArgumentsWithOptions && isListenerCall(current, sourceCode)) {
            calls.push(current)
        }
    }
    return calls
}

function isInUseEffect(node: ESTree.Node, sourceCode: SourceCode): boolean {
    for (let current = node.parent; current !== null; current = current.parent) {
        if (current.type === "CallExpression" && getPlainFunctionCallName(current, sourceCode) === "useEffect") {
            return true
        }
    }
    return false
}

function getNextStatement(node: ESTree.ExpressionStatement): ESTree.Node | null {
    const { parent } = node

    if (parent.type === "BlockStatement" || parent.type === "Program" || parent.type === "StaticBlock") {
        return parent.body[parent.body.indexOf(node) + 1] ?? null
    }
    if (parent.type === "SwitchCase") {
        return parent.consequent[parent.consequent.indexOf(node) + 1] ?? null
    }
    return null
}

/**
 * Whether tree-sitter saw nothing between `node` and the next statement. Comments were nodes of
 * their own, except the ones on `node`'s last line when `node` has no semicolon: tree-sitter put
 * the automatic semicolon after them, so they ended up inside `node`.
 */
function isDirectlyFollowed(node: ESTree.Node, sourceCode: SourceCode): boolean {
    const comments = sourceCode.getCommentsAfter(node)

    if (comments.length === 0) {
        return true
    }
    if (sourceCode.getText(node).endsWith(";")) {
        return false
    }
    let end = node.range[1]

    for (const comment of comments) {
        if (sourceCode.text.slice(end, comment.range[0]).includes("\n")) {
            return false
        }
        end = comment.range[1]
    }
    return true
}

export const useAbortControllerForMultipleListenersRule = defineRule({
    create(context) {
        const { sourceCode } = context
        const withListener = new Set<ESTree.ExpressionStatement>()
        const withSignal = new Set<ESTree.ExpressionStatement>()

        function isReported(statement: ESTree.ExpressionStatement): boolean {
            const next = getNextStatement(statement)

            return !withSignal.has(statement)
                && next?.type === "ExpressionStatement"
                && withListener.has(next)
                && isDirectlyFollowed(statement, sourceCode)
                && isInUseEffect(statement, sourceCode)
        }

        return {
            "CallExpression": (node) => {
                if (isListenerCall(node, sourceCode)) {
                    addStatementsAround(node, withListener)
                }
            },
            // oxlint-disable-next-line typescript-eslint-js/naming-convention
            "Program:exit": () => {
                const reported = [...withListener].filter((statement) => isReported(statement))

                for (const node of reported.toSorted((a, b) => a.range[0] - b.range[0])) {
                    context.report({ messageId: "useAbortController", node })
                }
            },
            "Property": (node) => {
                if (!isSignalOption(node)) {
                    return
                }
                for (const call of getListenerCallsAround(node, sourceCode)) {
                    addStatementsAround(call, withSignal)
                }
            },
        }
    },
    meta: {
        docs: {
            description: "Require an AbortController (`signal`) when a `useEffect` adds several event listeners",
        },
        messages: {
            useAbortController: "When using multiple event listeners in useEffect, use AbortController for cleanup instead of manual removeEventListener calls.",
        },
        schema: [],
        type:   "suggestion",
    },
})
