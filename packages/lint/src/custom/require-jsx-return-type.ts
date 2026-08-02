
import type { SourceCode, ReportFixFunction } from "@typescript-eslint/utils/ts-eslint"

import { TSESTree, ESLintUtils } from "@typescript-eslint/utils"

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

type FunctionNode =
    | TSESTree.FunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.ArrowFunctionExpression

interface RuleOptions {
    checkAllFunctions?: boolean
    typeName?:          string
}

const PascalCasePattern = /^[A-Z][A-Za-z\d]*$/

function isPascalCase(name: string): boolean {
    return PascalCasePattern.test(name)
}

function isJSXLike(node: null | TSESTree.Node | undefined): boolean {
    if (!node) {
        return false
    }
    switch (node.type) {
        case TSESTree.AST_NODE_TYPES.ConditionalExpression: {
            return isJSXLike(node.consequent) || isJSXLike(node.alternate)
        }
        case TSESTree.AST_NODE_TYPES.JSXElement:
        case TSESTree.AST_NODE_TYPES.JSXFragment: {
            return true
        }
        case TSESTree.AST_NODE_TYPES.LogicalExpression: {
            return isJSXLike(node.right)
        }
        case TSESTree.AST_NODE_TYPES.TSAsExpression:
        case TSESTree.AST_NODE_TYPES.TSNonNullExpression:
        case TSESTree.AST_NODE_TYPES.TSSatisfiesExpression: {
            return isJSXLike(node.expression)
        }
        default: {
            return false
        }
    }
}

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

function isPascalCaseDeclarator(node: TSESTree.Node): boolean {
    return node.type === TSESTree.AST_NODE_TYPES.VariableDeclarator
        && node.id.type === TSESTree.AST_NODE_TYPES.Identifier
        && isPascalCase(node.id.name)
}

/** `memo(() => <div />)` / `forwardRef(...)` assigned to a PascalCase binding. */
function isWrappedComponent(node: TSESTree.CallExpression): boolean {
    const owner = node.parent
    return isPascalCaseDeclarator(owner)
        || owner.type === TSESTree.AST_NODE_TYPES.ExportDefaultDeclaration
}

function isComponentExpression(node: FunctionNode): boolean {
    const parent = node.parent
    if (parent.type === TSESTree.AST_NODE_TYPES.ExportDefaultDeclaration) {
        return true
    }
    if (parent.type === TSESTree.AST_NODE_TYPES.CallExpression) {
        return isWrappedComponent(parent)
    }
    return isPascalCaseDeclarator(parent)
}

function isComponentLike(node: FunctionNode): boolean {
    if (node.type === TSESTree.AST_NODE_TYPES.FunctionDeclaration) {
        return node.id
            ? isPascalCase(node.id.name)
            : node.parent.type === TSESTree.AST_NODE_TYPES.ExportDefaultDeclaration
    }
    return isComponentExpression(node)
}

/** `const Card: React.FC = () => <div />` already pins the return type. */
function hasContextualType(node: FunctionNode): boolean {
    const parent = node.parent
    return parent.type === TSESTree.AST_NODE_TYPES.VariableDeclarator
        && parent.id.typeAnnotation !== undefined
}

function isCandidate(node: FunctionNode, checkAllFunctions: boolean): boolean {
    if (node.returnType || hasContextualType(node)) {
        return false
    }
    return checkAllFunctions || isComponentLike(node)
}

/**
 * The token the return type must follow: the `)` closing the parameter list, or
 * the lone parameter of a parenless arrow (`x => ...`).
 */
function getAnchorToken(node: FunctionNode, sourceCode: SourceCode): null | TSESTree.Token {
    if (node.type !== TSESTree.AST_NODE_TYPES.ArrowFunctionExpression) {
        return sourceCode.getTokenBefore(node.body)
    }
    const arrowToken = sourceCode.getTokenBefore(
        node.body,
        (token) => token.type === TSESTree.AST_TOKEN_TYPES.Punctuator && token.value === "=>",
    )
    return arrowToken ? sourceCode.getTokenBefore(arrowToken) : null
}

function getReportNode(node: FunctionNode): TSESTree.Node {
    if (node.type === TSESTree.AST_NODE_TYPES.FunctionDeclaration && node.id) {
        return node.id
    }
    if (node.parent.type === TSESTree.AST_NODE_TYPES.VariableDeclarator) {
        return node.parent.id
    }
    return node
}

export const requireJSXReturnTypeRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/react-template/eslint-rules#${name}`,
)<[RuleOptions], "missingJSXReturnType">({
    create(context, [options]) {
        const sourceCode = context.sourceCode
        const typeName = options.typeName ?? "React.ReactNode"
        const checkAllFunctions = options.checkAllFunctions ?? false
        const candidates = new Set<FunctionNode>()
        const jsxReturning = new Set<FunctionNode>()

        function buildFixer(node: FunctionNode): ReportFixFunction {
            return (fixer) => {
                const anchor = getAnchorToken(node, sourceCode)
                if (!anchor) {
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
            if (node.body.type !== TSESTree.AST_NODE_TYPES.BlockStatement && isJSXLike(node.body)) {
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
            "ReturnStatement": (node: TSESTree.ReturnStatement) => {
                if (!isJSXLike(node.argument)) {
                    return
                }
                const enclosing = getEnclosingFunction(node)
                if (enclosing) {
                    jsxReturning.add(enclosing)
                }
            },
        }
    },
    defaultOptions: [{}],
    meta:           {
        docs: {
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
    name: "require-jsx-return-type",
})
