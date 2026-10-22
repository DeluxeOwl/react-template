import {
    type Rule, defineRule, type ESTree, type Visitor, type SourceCode,
} from "@oxlint/plugins"

/*
 * The view-only rules check code inside a component. A component is what it was when these rules
 * were ast-grep rules (until @deluxeowl/lint 0.5.0): an arrow function or a named function
 * declaration that contains, anywhere inside it, a JSX element with a closing tag (or a fragment)
 * that contains more JSX.
 *
 *   const Row = () => <li><span /></li>                       a component
 *   const Wrap = () => <Ctx.Provider value={v}>{children}</Ctx.Provider>   not: no JSX inside
 *   const Icon = () => <Svg />                                 not: no closing tag
 *
 * Code anywhere inside a component counts, nested callbacks too, and the function doesn't have to be
 * the nearest one: a function that only contains a component is itself one. Never components:
 * function expressions (`forwardRef(function Button() {…})`), methods, generators and the anonymous
 * `export default function () {}` (tree-sitter parsed those as other kinds of function).
 */

/** tree-sitter's `jsx_element`: an element with a closing tag, or a fragment. */
export function isJSXContainer(node: ESTree.Node): boolean {
    return node.type === "JSXFragment" || (node.type === "JSXElement" && node.closingElement !== null)
}

/** tree-sitter's `arrow_function` and `function_declaration`. */
function isComponentShaped(node: ESTree.Node): boolean {
    return node.type === "ArrowFunctionExpression"
        || (node.type === "FunctionDeclaration" && node.id !== null && !node.generator)
}

/** Adds the functions around `jsx` that are components because a JSX container around `jsx` is inside them. */
function addComponentsAround(jsx: ESTree.JSXElement | ESTree.JSXFragment, components: Set<ESTree.Node>): void {
    let isInContainer = false

    for (let node: ESTree.Node | null = jsx.parent; node !== null; node = node.parent) {
        if (isJSXContainer(node)) {
            isInContainer = true
        } else if (isInContainer && isComponentShaped(node)) {
            components.add(node)
        }
    }
}

function isInside(node: ESTree.Node, components: ReadonlySet<ESTree.Node>): boolean {
    for (let current = node.parent; current !== null; current = current.parent) {
        if (components.has(current)) {
            return true
        }
    }
    return false
}

/** Visitors that collect the nodes a rule reports if they turn out to be inside a component. */
export interface Collector {
    visitor:    Visitor
    candidates: () => Iterable<ESTree.Node>
}

export interface ViewOnlyRuleSpec {
    description: string
    message:     string
    collect:     (sourceCode: SourceCode) => Collector
}

// Whether a node is inside a component is only known at the end: the JSX usually comes after the
// hooks and statements the rules look at. So the rules collect candidates and report at Program:exit.
export function createViewOnlyRule(spec: ViewOnlyRuleSpec): Rule {
    return defineRule({
        create(context) {
            const components = new Set<ESTree.Node>()
            const { candidates, visitor } = spec.collect(context.sourceCode)

            return {
                ...visitor,
                "JSXElement": (node) => {
                    addComponentsAround(node, components)
                },
                "JSXFragment": (node) => {
                    addComponentsAround(node, components)
                },
                "Program:exit": () => {
                    const found = [...candidates()].filter((node) => isInside(node, components))

                    for (const node of found.toSorted((a, b) => a.range[0] - b.range[0])) {
                        context.report({ messageId: "viewOnly", node })
                    }
                },
            }
        },
        meta: {
            docs:     { description: spec.description },
            messages: { viewOnly: spec.message },
            schema:   [],
            type:     "suggestion",
        },
    })
}

/** A collector that reports every node `visit` adds. */
export function collectEach(visit: (add: (node: ESTree.Node) => void) => Visitor): Collector {
    const nodes: ESTree.Node[] = []

    return {
        candidates: () => nodes,
        visitor:    visit((node) => {
            nodes.push(node)
        }),
    }
}

/** tree-sitter's `lexical_declaration`: `let` and `const`, but not `var`, `using` or a for-in/for-of head. */
export function isLexicalDeclaration(node: ESTree.Node): boolean {
    if (node.type !== "VariableDeclaration" || (node.kind !== "let" && node.kind !== "const")) {
        return false
    }
    const { parent } = node
    const isLoopHead = (parent.type === "ForInStatement" || parent.type === "ForOfStatement") && parent.left === node

    return !isLoopHead
}

/** Adds the `let`/`const` declarations around `node` (all of them, not only the nearest). */
export function addDeclarationsAround(node: ESTree.Node, declarations: Set<ESTree.Node>): void {
    for (let current = node.parent; current !== null; current = current.parent) {
        if (isLexicalDeclaration(current)) {
            declarations.add(current)
        }
    }
}
