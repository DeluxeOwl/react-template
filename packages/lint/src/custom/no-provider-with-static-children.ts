import type { Scope } from "@typescript-eslint/utils/ts-eslint"

import {
    ASTUtils, TSESLint, TSESTree, ESLintUtils,
} from "@typescript-eslint/utils"

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

export type Options = [{
    ignoredHooks?:     string[]
    requireStateHook?: boolean
}]

export type MessageIds = "providerWithStaticChildren"

type FunctionNode
    = | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression

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

const HookNamePattern = /^use[A-Z]/

function isFunctionNode(node: TSESTree.Node): node is FunctionNode {
    return node.type === TSESTree.AST_NODE_TYPES.ArrowFunctionExpression
        || node.type === TSESTree.AST_NODE_TYPES.FunctionDeclaration
        || node.type === TSESTree.AST_NODE_TYPES.FunctionExpression
}

function getEnclosingFunction(node: TSESTree.Node): FunctionNode | null {
    let current: TSESTree.Node | undefined = node.parent
    while (current) {
        if (isFunctionNode(current)) {
            return current
        }
        current = current.parent
    }
    return null
}

/** `useState(...)` and `React.useState(...)` both resolve to "useState". */
function getCalleeName(node: TSESTree.CallExpression): null | string {
    if (node.callee.type === TSESTree.AST_NODE_TYPES.Identifier) {
        return node.callee.name
    }
    if (node.callee.type === TSESTree.AST_NODE_TYPES.MemberExpression
        && node.callee.property.type === TSESTree.AST_NODE_TYPES.Identifier
        && !node.callee.computed) {
        return node.callee.property.name
    }
    return null
}

function getJSXName(node: TSESTree.JSXTagNameExpression): null | string {
    if (node.type === TSESTree.AST_NODE_TYPES.JSXIdentifier) {
        return node.name
    }
    if (node.type === TSESTree.AST_NODE_TYPES.JSXMemberExpression) {
        return `${getJSXName(node.object) ?? "?"}.${node.property.name}`
    }
    return null
}

function hasValueAttribute(node: TSESTree.JSXOpeningElement): boolean {
    return node.attributes.some((attr) =>
        attr.type === TSESTree.AST_NODE_TYPES.JSXAttribute
        && attr.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier
        && attr.name.name === "value")
}

/**
 * `<Ctx.Provider>` (legacy) or `<SomethingContext value={...}>` (React 19
 * shorthand, where the context object is rendered directly).
 */
function isContextProvider(node: TSESTree.JSXOpeningElement): boolean {
    if (node.name.type === TSESTree.AST_NODE_TYPES.JSXMemberExpression) {
        return node.name.property.name === "Provider"
    }
    if (node.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier) {
        return node.name.name.endsWith("Context") && hasValueAttribute(node)
    }
    return false
}

/** The identifier an expression is rooted at: `props.children` -> `props`. */
function getRootIdentifier(node: TSESTree.Node): null | TSESTree.Identifier {
    if (node.type === TSESTree.AST_NODE_TYPES.Identifier) {
        return node
    }
    if (node.type === TSESTree.AST_NODE_TYPES.MemberExpression) {
        return getRootIdentifier(node.object)
    }
    return null
}

/**
 * Children that came in as a prop were created by the caller, so the provider
 * re-rendering does not re-render them. Anything built inside the component
 * (JSX literals, `.map(...)` calls, local variables) is a new element tree on
 * every render.
 */
function isChildrenFromProps(node: TSESTree.Node, scope: Scope.Scope): boolean {
    if (node.type === TSESTree.AST_NODE_TYPES.ConditionalExpression) {
        return isChildrenFromProps(node.consequent, scope)
            && isChildrenFromProps(node.alternate, scope)
    }
    if (node.type === TSESTree.AST_NODE_TYPES.LogicalExpression) {
        return isChildrenFromProps(node.right, scope)
    }
    const root = getRootIdentifier(node)
    if (!root) {
        return false
    }
    const variable = ASTUtils.findVariable(scope, root.name)
    return variable?.defs.some((def) => def.type === TSESLint.Scope.DefinitionType.Parameter) ?? false
}

export const noProviderWithStaticChildrenRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/react-template/eslint-rules#${name}`,
)<Options, MessageIds>({
    create(context, [options]) {
        const ignoredHooks = options.ignoredHooks ?? DefaultIgnoredHooks
        const requireStateHook = options.requireStateHook ?? true
        const statefulFunctions = new Set<FunctionNode>()
        const candidates: { fn: FunctionNode, node: TSESTree.JSXElement }[] = []

        function isStaticChild(child: TSESTree.JSXChild): boolean {
            if (child.type === TSESTree.AST_NODE_TYPES.JSXText) {
                return false
            }
            if (child.type !== TSESTree.AST_NODE_TYPES.JSXExpressionContainer) {
                return true
            }
            if (child.expression.type === TSESTree.AST_NODE_TYPES.JSXEmptyExpression) {
                return false
            }
            return !isChildrenFromProps(child.expression, context.sourceCode.getScope(child))
        }

        return {
            "CallExpression": (node: TSESTree.CallExpression) => {
                const name = getCalleeName(node)
                if (!name || !HookNamePattern.test(name) || ignoredHooks.includes(name)) {
                    return
                }
                const enclosing = getEnclosingFunction(node)
                if (enclosing) {
                    statefulFunctions.add(enclosing)
                }
            },
            "JSXElement": (node: TSESTree.JSXElement) => {
                if (!isContextProvider(node.openingElement) || !node.children.some(isStaticChild)) {
                    return
                }
                const enclosing = getEnclosingFunction(node)
                if (enclosing) {
                    candidates.push({ fn: enclosing, node })
                }
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
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
    defaultOptions: [{}],
    meta:           {
        docs: {
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
    name: "no-provider-with-static-children",
})
