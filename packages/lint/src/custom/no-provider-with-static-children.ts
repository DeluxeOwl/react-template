import {
    defineRule, type Scope, type ESTree, type Variable,
} from "@oxlint/plugins"

/*
 * ----------------------------------------------------------------------------
 * Rule: no-provider-with-static-children
 * ----------------------------------------------------------------------------
 * A context provider that is rendered by a *stateful* component around a
 * hard-coded subtree re-renders that whole subtree on every state update,
 * even for children that never read the context. The re-render comes from the
 * parent-child structure, not from the context itself.
 *
 * The fix is to extract the provider into its own component whose subtree is
 * passed in as `children`. React then reuses the same element objects for the
 * children across renders, so they bail out.
 *
 * Examples that MATCH (bad):
 *   function Parent() {
 *       const [count, setCount] = useState(0)
 *       return (
 *           <Ctx.Provider value={{ count, setCount }}>
 *               <TreeOfChildren />
 *           </Ctx.Provider>
 *       )
 *   }
 *
 *   function Parent() {
 *       const store = useStore()                       // custom hook == state
 *       return <ThemeContext value={store}><Tree /></ThemeContext>
 *   }
 *
 * Examples that do NOT match (good):
 *   function CountProvider({ children }) {
 *       const [count, setCount] = useState(0)
 *       return <Ctx.Provider value={{ count, setCount }}>{children}</Ctx.Provider>
 *   }
 *
 *   function Parent() {
 *       return <CountProvider><TreeOfChildren /></CountProvider>
 *   }
 *
 *   // No state in the component -> nothing can trigger the re-render.
 *   function App() {
 *       return <Ctx.Provider value={staticValue}><Tree /></Ctx.Provider>
 *   }
 * ----------------------------------------------------------------------------
 */

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function

interface RuleOptions {
    requireStateHook: boolean
    ignoredHooks:     string[]
}

const DefaultIgnoredHooks = [
    "useId",
    "useRef",
    "useMemo",
    "useEffect",
    "useCallback",
    "useDebugValue",
    "useLayoutEffect",
    "useInsertionEffect",
    "useImperativeHandle",
]

const HookNamePattern = /^use[A-Z]/u

// oxlint already merged `meta.defaultOptions` in and validated against `meta.schema`.
function readOptions(options: readonly unknown[]): RuleOptions {
    const [first] = options
    const given = typeof first === "object" && first !== null ? first : {}

    return {
        ignoredHooks: "ignoredHooks" in given && Array.isArray(given.ignoredHooks)
            ? given.ignoredHooks.filter((hook): hook is string => typeof hook === "string")
            : DefaultIgnoredHooks,
        requireStateHook: !("requireStateHook" in given) || given.requireStateHook !== false,
    }
}

function isFunctionNode(node: ESTree.Node): node is FunctionNode {
    return node.type === "ArrowFunctionExpression"
        || node.type === "FunctionDeclaration"
        || node.type === "FunctionExpression"
}

function getEnclosingFunction(node: ESTree.Node): FunctionNode | null {
    let current = node.parent

    while (current !== null) {
        if (isFunctionNode(current)) {
            return current
        }
        current = current.parent
    }
    return null
}

/** `useState(...)` and `React.useState(...)` both resolve to "useState". */
function getCalleeName(node: ESTree.CallExpression): null | string {
    const { callee } = node

    if (callee.type === "Identifier") {
        return callee.name
    }
    if (callee.type === "MemberExpression" && !callee.computed && callee.property.type === "Identifier") {
        return callee.property.name
    }
    return null
}

function getJSXName(node: ESTree.JSXElementName): null | string {
    if (node.type === "JSXIdentifier") {
        return node.name
    }
    if (node.type === "JSXMemberExpression") {
        return `${getJSXName(node.object) ?? "?"}.${node.property.name}`
    }
    return null
}

function hasValueAttribute(node: ESTree.JSXOpeningElement): boolean {
    return node.attributes.some((attr) => attr.type === "JSXAttribute"
        && attr.name.type === "JSXIdentifier"
        && attr.name.name === "value")
}

/**
 * `<Ctx.Provider>` (legacy) or `<SomethingContext value={...}>` (React 19
 * shorthand, where the context object is rendered directly).
 */
function isContextProvider(node: ESTree.JSXOpeningElement): boolean {
    if (node.name.type === "JSXMemberExpression") {
        return node.name.property.name === "Provider"
    }
    if (node.name.type === "JSXIdentifier") {
        return node.name.name.endsWith("Context") && hasValueAttribute(node)
    }
    return false
}

/** The name an expression is rooted at: `props.children` -> `props`. */
function getRootName(node: ESTree.Node): null | string {
    if (node.type === "Identifier") {
        return node.name
    }
    if (node.type === "MemberExpression") {
        return getRootName(node.object)
    }
    return null
}

function findVariable(scope: Scope, name: string): null | Variable {
    for (let current: null | Scope = scope; current !== null; current = current.upper) {
        const variable = current.set.get(name)

        if (variable !== undefined) {
            return variable
        }
    }
    return null
}

/**
 * Children that came in as a prop were created by the caller, so the provider
 * re-rendering does not re-render them. Anything built inside the component
 * (JSX literals, `.map(...)` calls, local variables) is a new element tree on
 * every render.
 */
function isChildrenFromProps(node: ESTree.Node, scope: Scope): boolean {
    if (node.type === "ConditionalExpression") {
        return isChildrenFromProps(node.consequent, scope)
            && isChildrenFromProps(node.alternate, scope)
    }
    if (node.type === "LogicalExpression") {
        return isChildrenFromProps(node.right, scope)
    }
    const rootName = getRootName(node)
    if (rootName === null) {
        return false
    }
    const variable = findVariable(scope, rootName)
    return variable?.defs.some((def) => def.type === "Parameter") ?? false
}

export const noProviderWithStaticChildrenRule = defineRule({
    create(context) {
        const { ignoredHooks, requireStateHook } = readOptions(context.options)
        const statefulFunctions = new Set<FunctionNode>()
        const candidates: { fn: FunctionNode, node: ESTree.JSXElement }[] = []

        function isStaticChild(child: ESTree.JSXChild): boolean {
            if (child.type === "JSXText") {
                return false
            }
            if (child.type !== "JSXExpressionContainer") {
                return true
            }
            if (child.expression.type === "JSXEmptyExpression") {
                return false
            }
            return !isChildrenFromProps(child.expression, context.sourceCode.getScope(child))
        }

        return {
            "CallExpression": (node) => {
                const name = getCalleeName(node)
                if (name === null || !HookNamePattern.test(name) || ignoredHooks.includes(name)) {
                    return
                }
                const enclosing = getEnclosingFunction(node)
                if (enclosing !== null) {
                    statefulFunctions.add(enclosing)
                }
            },
            "JSXElement": (node) => {
                if (!isContextProvider(node.openingElement) || !node.children.some((child) => isStaticChild(child))) {
                    return
                }
                const enclosing = getEnclosingFunction(node)
                if (enclosing !== null) {
                    candidates.push({ fn: enclosing, node })
                }
            },
            // oxlint-disable-next-line typescript-eslint-js/naming-convention
            "Program:exit": () => {
                for (const { fn, node } of candidates) {
                    if (requireStateHook && !statefulFunctions.has(fn)) {
                        continue
                    }
                    context.report({
                        data:      { name: getJSXName(node.openingElement.name) ?? "Provider" },
                        messageId: "providerWithStaticChildren",
                        node:      node.openingElement,
                    })
                }
            },
        }
    },
    meta: {
        defaultOptions: [{}],
        docs:           {
            description: "Disallow rendering a context provider around a hard-coded subtree inside a stateful component",
        },
        messages: {
            providerWithStaticChildren: "`<{{name}}>` wraps a subtree that is created in this component, and this component holds state. Every state update re-renders the whole subtree, even children that never read the context. Extract the provider into its own component that renders `{children}`, then wrap the subtree with it.",
        },
        schema: [
            {
                additionalProperties: false,
                properties:           {
                    ignoredHooks: {
                        description: "Hook names that do not by themselves trigger a re-render.",
                        items:       { type: "string" },
                        type:        "array",
                    },
                    requireStateHook: {
                        description: "Only report when the enclosing component also calls a hook that can trigger a re-render.",
                        type:        "boolean",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
})
