import {
    defineRule, type FixFn, type Token, type ESTree, type SourceCode,
} from "@oxlint/plugins"

/*
  * ----------------------------------------------------------------------------
  * Rule: require-jsx-return-type
  * ----------------------------------------------------------------------------
  * Requires an explicit return type on component functions that return JSX and
  * autofixes it by inserting `React.ReactNode` after the parameter list.
  *
  * Examples that MATCH (bad):
  *   function EmptyContent({ className }: Props) { return <div /> }
  *   export const Card = () => <div />
  *   export default function Page() { return <><span /></> }
  *
  * Examples that do NOT match (good):
  *   function EmptyContent({ className }: Props): React.ReactNode { return <div /> }
  *   const Card: React.FC = () => <div />
  *   items.map((item) => <li key={item} />)
  *   function useThing() { return 1 }
  * ----------------------------------------------------------------------------
  */

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function

interface RuleOptions {
    typeName:          string
    checkAllFunctions: boolean
}

const PascalCasePattern = /^[A-Z][\dA-Za-z]*$/u

// oxlint already merged `meta.defaultOptions` in and validated against `meta.schema`.
function readOptions(options: readonly unknown[]): RuleOptions {
    const [first] = options
    const given = typeof first === "object" && first !== null ? first : {}

    return {
        checkAllFunctions: "checkAllFunctions" in given && given.checkAllFunctions === true,
        typeName:          "typeName" in given && typeof given.typeName === "string" ? given.typeName : "React.ReactNode",
    }
}

function isPascalCase(name: string): boolean {
    return PascalCasePattern.test(name)
}

function isJSXLike(node: ESTree.Node | null): boolean {
    if (node === null) {
        return false
    }
    if (node.type === "JSXElement" || node.type === "JSXFragment") {
        return true
    }
    if (node.type === "ConditionalExpression") {
        return isJSXLike(node.consequent) || isJSXLike(node.alternate)
    }
    if (node.type === "LogicalExpression") {
        return isJSXLike(node.right)
    }
    if (node.type === "TSAsExpression" || node.type === "TSNonNullExpression" || node.type === "TSSatisfiesExpression") {
        return isJSXLike(node.expression)
    }
    return false
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

function isPascalCaseDeclarator(node: ESTree.Node): boolean {
    return node.type === "VariableDeclarator"
        && node.id.type === "Identifier"
        && isPascalCase(node.id.name)
}

/** `memo(() => <div />)` / `forwardRef(...)` assigned to a PascalCase binding. */
function isWrappedComponent(node: ESTree.CallExpression): boolean {
    const owner = node.parent
    return isPascalCaseDeclarator(owner) || owner.type === "ExportDefaultDeclaration"
}

function isComponentExpression(node: FunctionNode): boolean {
    const parent = node.parent
    if (parent.type === "ExportDefaultDeclaration") {
        return true
    }
    if (parent.type === "CallExpression") {
        return isWrappedComponent(parent)
    }
    return isPascalCaseDeclarator(parent)
}

function isComponentLike(node: FunctionNode): boolean {
    if (node.type === "FunctionDeclaration") {
        // `export default function () {}` has no name.
        return node.id === null ? node.parent.type === "ExportDefaultDeclaration" : isPascalCase(node.id.name)
    }
    return isComponentExpression(node)
}

/** `const Card: React.FC = () => <div />` already pins the return type. */
function hasContextualType(node: FunctionNode): boolean {
    const parent = node.parent
    return parent.type === "VariableDeclarator" && Boolean(parent.id.typeAnnotation)
}

function isCandidate(node: FunctionNode, checkAllFunctions: boolean): boolean {
    if (Boolean(node.returnType) || hasContextualType(node)) {
        return false
    }
    return checkAllFunctions || isComponentLike(node)
}

/**
 * The token the return type must follow: the `)` closing the parameter list, or
 * the lone parameter of a parenless arrow (`x => ...`).
 */
function getAnchorToken(node: FunctionNode, sourceCode: SourceCode): null | Token {
    if (node.body === null) {
        return null
    }
    if (node.type !== "ArrowFunctionExpression") {
        return sourceCode.getTokenBefore(node.body)
    }
    const arrowToken = sourceCode.getTokenBefore(
        node.body,
        (token) => token.type === "Punctuator" && token.value === "=>",
    )
    return arrowToken === null ? null : sourceCode.getTokenBefore(arrowToken)
}

function getReportNode(node: FunctionNode): ESTree.Node {
    if (node.type === "FunctionDeclaration" && node.id !== null) {
        return node.id
    }
    if (node.parent.type === "VariableDeclarator") {
        return node.parent.id
    }
    return node
}

// An arrow whose body is the JSX itself: `() => <div />`.
function returnsJSXExpression(node: FunctionNode): boolean {
    return node.type === "ArrowFunctionExpression" && node.body.type !== "BlockStatement" && isJSXLike(node.body)
}

export const requireJSXReturnTypeRule = defineRule({
    create(context) {
        const sourceCode = context.sourceCode
        const { checkAllFunctions, typeName } = readOptions(context.options)
        const candidates = new Set<FunctionNode>()
        const jsxReturning = new Set<FunctionNode>()

        function buildFixer(node: FunctionNode): FixFn {
            return (fixer) => {
                const anchor = getAnchorToken(node, sourceCode)
                if (anchor === null) {
                    return null
                }
                if (anchor.value === ")") {
                    return fixer.insertTextAfter(anchor, `: ${typeName}`)
                }
                return fixer.replaceText(anchor, `(${anchor.value}): ${typeName}`)
            }
        }

        function collect(node: FunctionNode): void {
            if (!isCandidate(node, checkAllFunctions)) {
                return
            }
            candidates.add(node)
            if (returnsJSXExpression(node)) {
                jsxReturning.add(node)
            }
        }

        return {
            "ArrowFunctionExpression": collect,
            "FunctionDeclaration":     collect,
            "FunctionExpression":      collect,
            "Program:exit":            () => {
                for (const node of candidates) {
                    if (jsxReturning.has(node)) {
                        context.report({
                            data:      { typeName },
                            fix:       buildFixer(node),
                            messageId: "missingJSXReturnType",
                            node:      getReportNode(node),
                        })
                    }
                }
            },
            "ReturnStatement": (node) => {
                if (!isJSXLike(node.argument)) {
                    return
                }
                const enclosing = getEnclosingFunction(node)
                if (enclosing !== null) {
                    jsxReturning.add(enclosing)
                }
            },
        }
    },
    meta: {
        defaultOptions: [{}],
        docs:           {
            description: "Require an explicit React.ReactNode return type on functions that return JSX",
        },
        fixable:  "code",
        messages: {
            missingJSXReturnType: "This function returns JSX but has no return type. Declare it as `{{typeName}}`.",
        },
        schema: [
            {
                additionalProperties: false,
                properties:           {
                    checkAllFunctions: {
                        description: "Also check functions that are not named like a component (e.g. inline callbacks).",
                        type:        "boolean",
                    },
                    typeName: {
                        description: "The return type to require and insert.",
                        type:        "string",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
})
