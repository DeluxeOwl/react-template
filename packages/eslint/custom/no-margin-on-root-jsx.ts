
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"

import { TSESTree, ESLintUtils } from "@typescript-eslint/utils"

/*
  * ----------------------------------------------------------------------------
  * Rule: no-margin-on-root-jsx
  * ----------------------------------------------------------------------------
  * Flags margin classes or style props on the outermost JSX element.
  * Outer elements with margin can cause layout issues and should be avoided.
  *
  * Examples that MATCH (bad):
  *   return <div className="me-2">
  *   return <div className="mr-4">
  *   return <div className="m-4">
  *   return <div style={{ margin: 10 }}>
  *   return <div style={{ marginTop: 10 }}>
  *
  * Examples that do NOT match (good):
  *   return <div className="p-4">
  *   return <div className="text-center">
  *   return <div style={{ padding: 10 }}>
  *   return <></>
  *   return <Component />
  * ----------------------------------------------------------------------------
  */

const MARGIN_CLASS_PATTERN = /!?-?m[trblxyse]?-(\d+|\[.+?\])|!?-?ms-(\d+|\[.+?\])|!?-?me-(\d+|\[.+?\])|!?-?mb-(\d+|\[.+?\])|!?-?mt-(\d+|\[.+?\])|!?-?ml-(\d+|\[.+?\])|!?-?mr-(\d+|\[.+?\])|!?-?mx-(\d+|\[.+?\])|!?-?my-(\d+|\[.+?\])/

function extractStringsFromLiteral(node: TSESTree.Literal): string[] {
    if (typeof node.value === "string") {
        return [node.value]
    }
    return []
}

function extractStringsFromTemplateLiteral(node: TSESTree.TemplateLiteral): string[] {
    const strings: string[] = []
    for (const quasis of node.quasis) {
        if (quasis.value.cooked) {
            strings.push(quasis.value.cooked)
        }
    }
    for (const expr of node.expressions) {
        strings.push(...extractStringsFromExpression(expr))
    }
    return strings
}

function extractStringsFromCallExpression(node: TSESTree.CallExpression): string[] {
    const strings: string[] = []
    for (const arg of node.arguments) {
        if (arg.type === TSESTree.AST_NODE_TYPES.Literal) {
            strings.push(...extractStringsFromLiteral(arg))
        } else if (arg.type === TSESTree.AST_NODE_TYPES.TemplateLiteral) {
            strings.push(...extractStringsFromTemplateLiteral(arg))
        }
    }
    return strings
}

function extractStringsFromBinaryExpression(node: TSESTree.BinaryExpression): string[] {
    if (node.operator === "+") {
        return [...extractStringsFromExpression(node.left), ...extractStringsFromExpression(node.right)]
    }
    return []
}

function extractStringsFromConditionalExpression(node: TSESTree.ConditionalExpression): string[] {
    return [
        ...extractStringsFromExpression(node.consequent),
        ...extractStringsFromExpression(node.alternate),
    ]
}

function extractStringsFromLogicalExpression(node: TSESTree.LogicalExpression): string[] {
    return [
        ...extractStringsFromExpression(node.left),
        ...extractStringsFromExpression(node.right),
    ]
}

function extractStringsFromExpression(node: TSESTree.Expression | TSESTree.JSXEmptyExpression): string[] {
    if (node.type === TSESTree.AST_NODE_TYPES.JSXEmptyExpression) {
        return []
    }
    switch (node.type) {
        case TSESTree.AST_NODE_TYPES.BinaryExpression: {
            return extractStringsFromBinaryExpression(node)
        }
        case TSESTree.AST_NODE_TYPES.CallExpression: {
            return extractStringsFromCallExpression(node)
        }
        case TSESTree.AST_NODE_TYPES.ConditionalExpression: {
            return extractStringsFromConditionalExpression(node)
        }
        case TSESTree.AST_NODE_TYPES.Literal: {
            return extractStringsFromLiteral(node)
        }
        case TSESTree.AST_NODE_TYPES.LogicalExpression: {
            return extractStringsFromLogicalExpression(node)
        }
        case TSESTree.AST_NODE_TYPES.TemplateLiteral: {
            return extractStringsFromTemplateLiteral(node)
        }
        default: {
            return []
        }
    }
}

function hasMarginClass(node: TSESTree.JSXAttribute): boolean {
    if (node.value?.type === TSESTree.AST_NODE_TYPES.Literal) {
        const value = node.value.value
        if (typeof value !== "string") {
            return false
        }
        return MARGIN_CLASS_PATTERN.test(value)
    }
    if (node.value?.type === TSESTree.AST_NODE_TYPES.JSXExpressionContainer) {
        const strings = extractStringsFromExpression(node.value.expression)
        return strings.some((s) => MARGIN_CLASS_PATTERN.test(s))
    }
    return false
}

function hasMarginStyle(node: TSESTree.JSXAttribute): boolean {
    if (node.value?.type !== TSESTree.AST_NODE_TYPES.JSXExpressionContainer) {
        return false
    }
    const expression = node.value.expression
    if (expression.type === TSESTree.AST_NODE_TYPES.ObjectExpression) {
        for (const prop of expression.properties) {
            if (prop.type === TSESTree.AST_NODE_TYPES.Property) {
                let keyName: null | string = null
                if (prop.key.type === TSESTree.AST_NODE_TYPES.Identifier) {
                    keyName = prop.key.name
                } else if (prop.key.type === TSESTree.AST_NODE_TYPES.Literal && typeof prop.key.value === "string") {
                    keyName = prop.key.value
                }
                if (keyName
                    && (keyName === "margin"
                        || keyName.startsWith("marginBlock")
                        || keyName.startsWith("marginInline")
                        || keyName.startsWith("marginTop")
                        || keyName.startsWith("marginRight")
                        || keyName.startsWith("marginBottom")
                        || keyName.startsWith("marginLeft")
                        || keyName.startsWith("marginVertical")
                        || keyName.startsWith("marginHorizontal")
                        || keyName === "marginBlockStart"
                        || keyName === "marginBlockEnd"
                        || keyName === "marginInlineStart"
                        || keyName === "marginInlineEnd")) {
                    return true
                }
            }
        }
    }
    return false
}

function getPropertyKey(prop: TSESTree.Property): null | string {
    if (prop.key.type === TSESTree.AST_NODE_TYPES.Identifier) {
        return prop.key.name
    }
    if (prop.key.type === TSESTree.AST_NODE_TYPES.Literal && typeof prop.key.value === "string") {
        return prop.key.value
    }
    return null
}

function hasMarginInSpread(node: TSESTree.JSXSpreadAttribute): boolean {
    const argument = node.argument
    if (argument.type !== TSESTree.AST_NODE_TYPES.ObjectExpression) {
        return false
    }
    for (const prop of argument.properties) {
        if (prop.type !== TSESTree.AST_NODE_TYPES.Property) {
            continue
        }
        const keyName = getPropertyKey(prop)
        if (keyName !== "className") {
            continue
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const strings = extractStringsFromExpression(prop.value as TSESTree.Expression)
        if (strings.some((s) => MARGIN_CLASS_PATTERN.test(s))) {
            return true
        }
    }
    return false
}

function isMarginProp(node: TSESTree.JSXAttribute): boolean {
    return hasMarginClass(node) || hasMarginStyle(node)
}

function getOutermostJSXElement(node: TSESTree.JSXElement | TSESTree.JSXFragment): null | TSESTree.JSXOpeningElement {
    if (node.type === TSESTree.AST_NODE_TYPES.JSXFragment) {
        return null
    }
    return node.openingElement
}

function isExportedArrowFunction(node: TSESTree.ArrowFunctionExpression): boolean {
    if (node.parent.type === TSESTree.AST_NODE_TYPES.VariableDeclarator) {
        const grandparent = node.parent.parent
        const declarationParent = grandparent.parent
        return declarationParent.type === TSESTree.AST_NODE_TYPES.ExportNamedDeclaration
            || declarationParent.type === TSESTree.AST_NODE_TYPES.ExportDefaultDeclaration
    }
    if (node.parent.type === TSESTree.AST_NODE_TYPES.ExportDefaultDeclaration) {
        return true
    }
    return false
}

function analyzeJSX(node: TSESTree.JSXElement | TSESTree.JSXFragment, context: RuleContext<string, []>): void {
    const ctx = context
    const outermostElement = getOutermostJSXElement(node)
    if (!outermostElement) {
        return
    }
    for (const attr of outermostElement.attributes) {
        if (attr.type === TSESTree.AST_NODE_TYPES.JSXAttribute && isMarginProp(attr)) {
            ctx.report({
                messageId: "noMarginOnRootJSX",
                node:      attr,
            })
            return
        }
        if (attr.type === TSESTree.AST_NODE_TYPES.JSXSpreadAttribute && hasMarginInSpread(attr)) {
            ctx.report({
                messageId: "noMarginOnRootJSX",
                node:      attr,
            })
            return
        }
    }
}

export const noMarginOnRootJSXRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/react-template/eslint-rules#${name}`,
)({
    create(context) {
        return {
            JSXElement(node) {
                if (node.parent.type === TSESTree.AST_NODE_TYPES.ReturnStatement) {
                    return
                }
                if (node.parent.type === TSESTree.AST_NODE_TYPES.JSXFragment) {
                    return
                }
                if (node.parent.type === TSESTree.AST_NODE_TYPES.ArrowFunctionExpression
                    && isExportedArrowFunction(node.parent)) {
                    analyzeJSX(node, context)
                }
                if (node.parent.type === TSESTree.AST_NODE_TYPES.VariableDeclarator) {
                    const grandparent = node.parent.parent
                    const declarationParent = grandparent.parent
                    if (declarationParent.type === TSESTree.AST_NODE_TYPES.ExportNamedDeclaration) {
                        analyzeJSX(node, context)
                    }
                }
            },
            ReturnStatement(node) {
                if (node.argument?.type === TSESTree.AST_NODE_TYPES.JSXElement) {
                    analyzeJSX(node.argument, context)
                } else if (node.argument?.type === TSESTree.AST_NODE_TYPES.JSXFragment) {
                    analyzeJSX(node.argument, context)
                }
            },
        }
    },
    defaultOptions: [],
    meta:           {
        docs: {
            description: "Disallow margin classes or style props on the outermost JSX element",
        },
        messages: {
            noMarginOnRootJSX: "Avoid using margin on the outermost returned JSX element. This can cause layout issues. Apply margin to a child element instead.",
        },
        schema: [],
        type:   "problem",
    },
    name: "no-margin-on-root-jsx",
})
