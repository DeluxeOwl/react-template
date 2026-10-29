import {
    defineRule, type ESTree, type Visitor, type SourceCode,
} from "@oxlint/plugins"

import { getPlainMethodCallName, getPlainFunctionCallName } from "./plain-call.ts"
import {
    collectEach, type Collector, isJSXContainer, createViewOnlyRule, isLexicalDeclaration, addDeclarationsAround,
} from "./view-only-component.ts"

/*
 * React components stay "view-only": one custom hook holds the logic, the component renders.
 * These rules were ast-grep rules until @deluxeowl/lint 0.5.0 (`ast-grep/rules/view-only-rules.yml`)
 * and flag what those flagged, including their gaps: see view-only-component.ts for what counts as a
 * component, and plain-call.ts for the calls they recognize.
 *
 * `no-multiple-hooks-in-component` is the exception: in ast-grep it never matched anything (its third
 * hook condition sat on the hook call instead of on the declaration). The port does what its comment
 * said: it flags the third hook declaration in a component.
 */

const BuiltinHooks = new Set([
    "useId",
    "useRef",
    "useMemo",
    "useState",
    "useEffect",
    "useContext",
    "useReducer",
    "useCallback",
    "useDebugValue",
    "useOptimistic",
    "useTransition",
    "useActionState",
    "useEffectEvent",
    "useLayoutEffect",
    "useDeferredValue",
    "useInsertionEffect",
    "useImperativeHandle",
    "useSyncExternalStore",
])

// Also `toReversed` without arguments, and `Object.groupBy` with two or more (isArrayMethodCall).
const ArrayMethods = new Set([
    "at",
    "find",
    "flat",
    "some",
    "sort",
    "with",
    "every",
    "slice",
    "concat",
    "reduce",
    "flatMap",
    "findLast",
    "includes",
    "toSorted",
    "findIndex",
    "toSpliced",
    "findLastIndex",
])

function isArrayMethodCall(node: ESTree.CallExpression, sourceCode: SourceCode): boolean {
    const name = getPlainMethodCallName(node, sourceCode)

    if (name === "toReversed") {
        return node.arguments.length === 0
    }
    if (name === "groupBy") {
        const { callee } = node
        const isObject = callee.type === "MemberExpression" && callee.object.type === "Identifier" && callee.object.name === "Object"

        return isObject && node.arguments.length > 1
    }
    return name !== null && ArrayMethods.has(name)
}

/** A collector for the `let`/`const` declarations that contain a node of one of `types`. */
function collectDeclarationsContaining(types: readonly string[]): () => Collector {
    return () => {
        const declarations = new Set<ESTree.Node>()
        const handler = (node: ESTree.Node): void => {
            addDeclarationsAround(node, declarations)
        }

        return {
            candidates: () => declarations,
            visitor:    Object.fromEntries(types.map((type) => [type, handler])) satisfies Visitor,
        }
    }
}

// `useReducer(reduce, 0)`, also inside callbacks. Not `React.useReducer(reduce, 0)` or `useReducer<number, [number]>(reduce, 0)` (plain-call.ts).
export const noBuiltinHooksInComponentRule = createViewOnlyRule({
    collect: (sourceCode) => collectEach((add) => ({
        CallExpression: (node) => {
            const name = getPlainFunctionCallName(node, sourceCode)

            if (name !== null && BuiltinHooks.has(name)) {
                add(node)
            }
        },
    })),
    description: "Disallow React's built-in hooks in components: they belong in the component's custom hook",
    message:     "Built-in hooks should be moved to a custom hook. Components should only call one custom hook.",
})

export const noFilterInComponentRule = createViewOnlyRule({
    collect: (sourceCode) => collectEach((add) => ({
        CallExpression: (node) => {
            if (getPlainMethodCallName(node, sourceCode) === "filter") {
                add(node)
            }
        },
    })),
    description: "Disallow `.filter()` in components",
    message:     "Avoid .filter() in components. Move filtering logic to a custom hook.",
})

// Any object's methods: `label.includes("x")` on a string too.
export const noArrayMethodsInComponentRule = createViewOnlyRule({
    collect: (sourceCode) => collectEach((add) => ({
        CallExpression: (node) => {
            if (isArrayMethodCall(node, sourceCode)) {
                add(node)
            }
        },
    })),
    description: "Disallow array transformation methods in components",
    message:     "Avoid array methods in components. Move data transformations to a custom hook.",
})

// A `let`/`const` declaration with a binary or logical expression anywhere inside it (`a + 1`,
// `a === b`, `a && b`, `a ?? b`, also inside a function it declares) and no call anywhere inside it.
// Tagged templates and `import()` count as calls, `new` doesn't. A declaration inside another is
// reported too.
export const noLogicExpressionsInComponentRule = createViewOnlyRule({
    collect: () => {
        const withLogic = new Set<ESTree.Node>()
        const withCall = new Set<ESTree.Node>()
        const addLogic = (node: ESTree.Node): void => {
            addDeclarationsAround(node, withLogic)
        }
        const addCall = (node: ESTree.Node): void => {
            addDeclarationsAround(node, withCall)
        }

        return {
            candidates: () => [...withLogic].filter((node) => !withCall.has(node)),
            visitor:    {
                BinaryExpression:         addLogic,
                CallExpression:           addCall,
                ImportExpression:         addCall,
                LogicalExpression:        addLogic,
                TaggedTemplateExpression: addCall,
            },
        }
    },
    description: "Disallow calculations in variable declarations in components",
    message:     "Avoid logic expressions in components. Move calculations to a custom hook.",
})

// A `let`/`const` declaration with any spread inside it: objects, arrays, call arguments and JSX
// (`<div {...props} />`). Rest patterns (`const { a, ...rest } = props`) are not spreads.
export const noObjectSpreadInComponentRule = createViewOnlyRule({
    collect:     collectDeclarationsContaining(["SpreadElement", "JSXSpreadAttribute", "JSXSpreadChild"]),
    description: "Disallow spreads in variable declarations in components",
    message:     "Avoid object spread in components. Move object composition to a custom hook.",
})

// A `let`/`const` declaration with a conditional expression anywhere inside it. Ternaries
// elsewhere, such as directly in the returned JSX, are fine.
export const noTernaryAssignmentInComponentRule = createViewOnlyRule({
    collect:     collectDeclarationsContaining(["ConditionalExpression"]),
    description: "Disallow conditional expressions in variable declarations in components",
    message:     "Avoid ternary assignments in components. Move conditional logic to a custom hook.",
})

// `use` and a capital letter at the start of a call, as ast-grep's `regex: ^use[A-Z]` on the call's
// text: `useQuery<T>()`, `useFoo?.()`, `useStore.getState()` and tagged templates count,
// `React.useReducer()` and `(useReducer)()` don't.
const HookCallStart = /^use[A-Z]/u

// Two hook declarations in a component are fine; the third and every later one are reported.
const AllowedHookDeclarations = 2

/** The statements of the block, switch case or program that `node` is a statement of. */
function getSiblingStatements(node: ESTree.Node): readonly ESTree.Node[] {
    const { parent } = node

    if (parent?.type === "BlockStatement" || parent?.type === "Program" || parent?.type === "StaticBlock") {
        return parent.body
    }
    if (parent?.type === "SwitchCase") {
        return parent.consequent
    }
    return []
}

function hasHookDeclarationsBefore(declaration: ESTree.Node, hookDeclarations: ReadonlySet<ESTree.Node>): boolean {
    const statements = getSiblingStatements(declaration)
    const before = statements.slice(0, statements.indexOf(declaration))

    return before.filter((statement) => hookDeclarations.has(statement)).length >= AllowedHookDeclarations
}

// A hook declaration is a `let`/`const` declaration with a hook call anywhere in it, also in a
// function it declares (`const f = () => useX()`); it counts once however many calls it has. The
// third one in a block, and every later one, is reported. They don't have to be next to each other.
// Hook calls that aren't in a declaration (`useEffect(…)`) and `var` don't count.
export const noMultipleHooksInComponentRule = createViewOnlyRule({
    collect: (sourceCode) => {
        const hookDeclarations = new Set<ESTree.Node>()
        const addHookCall = (node: ESTree.CallExpression | ESTree.TaggedTemplateExpression): void => {
            if (HookCallStart.test(sourceCode.getText(node))) {
                addDeclarationsAround(node, hookDeclarations)
            }
        }

        return {
            candidates: () => [...hookDeclarations].filter((node) => hasHookDeclarationsBefore(node, hookDeclarations)),
            visitor:    {
                CallExpression:           addHookCall,
                TaggedTemplateExpression: addHookCall,
            },
        }
    },
    description: "Disallow a third hook declaration in a component: combine the hooks into one custom hook",
    message:     "Components should use at most one custom hook. Combine hooks into a single custom hook.",
})

export const noLoopsInComponentRule = createViewOnlyRule({
    collect: () => collectEach((add) => ({
        DoWhileStatement: add,
        ForInStatement:   add,
        ForOfStatement:   add,
        ForStatement:     add,
        WhileStatement:   add,
    })),
    description: "Disallow loops in components",
    message:     "Avoid loops in components. Move iteration logic to a custom hook.",
})

export const noSwitchInComponentRule = createViewOnlyRule({
    collect: () => collectEach((add) => ({
        SwitchStatement: add,
    })),
    description: "Disallow switch statements in components",
    message:     "Avoid switch statements in components. Move branching logic to a custom hook or prefer a dispatcher component if using JSX.",
})

function isInJSXContainer(node: ESTree.Node): boolean {
    for (let current = node.parent; current !== null; current = current.parent) {
        if (isJSXContainer(current)) {
            return true
        }
    }
    return false
}

/**
 * The `.map(…)` calls inside JSX that have `declaration` in a block in an arrow function in them.
 * The arrow function can be anywhere inside the call, not only the callback: an `onClick` handler
 * in the mapped JSX counts, and so do the outer calls of nested maps.
 */
function getMapCallsAround(declaration: ESTree.Node, sourceCode: SourceCode): ESTree.Node[] {
    const calls: ESTree.Node[] = []
    let isInBlock = false
    let isInArrow = false

    for (let node = declaration.parent; node !== null; node = node.parent) {
        if (node.type === "BlockStatement" || node.type === "StaticBlock") {
            isInBlock = true
        } else if (isInBlock && node.type === "ArrowFunctionExpression") {
            isInArrow = true
        } else if (isInArrow && node.type === "CallExpression" && getPlainMethodCallName(node, sourceCode) === "map" && isInJSXContainer(node)) {
            calls.push(node)
        }
    }
    return calls
}

// `.map(…)` inside JSX (in a component or not) whose arrow callback declares a `let`/`const`.
// Early returns are fine; so are `var` and a `for (const x of xs)` head, which tree-sitter didn't
// parse as `let`/`const` declarations. `function` callbacks are not checked.
export const noLogicInMapCallbackRule = defineRule({
    create(context) {
        const calls = new Set<ESTree.Node>()

        return {
            "Program:exit": () => {
                for (const node of [...calls].toSorted((a, b) => a.range[0] - b.range[0])) {
                    context.report({ messageId: "logicInMap", node })
                }
            },
            "VariableDeclaration": (node) => {
                if (!isLexicalDeclaration(node)) {
                    return
                }
                for (const call of getMapCallsAround(node, context.sourceCode)) {
                    calls.add(call)
                }
            },
        }
    },
    meta: {
        docs:     { description: "Disallow variable declarations in `.map()` callbacks in JSX" },
        messages: {
            logicInMap: "Avoid logic inside .map() callbacks. Only early returns are allowed. Move data transformations to a custom hook or compute them before the map.",
        },
        schema: [],
        type:   "suggestion",
    },
})
