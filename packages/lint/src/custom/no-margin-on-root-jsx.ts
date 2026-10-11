import {
    defineRule, type ESTree, type Context,
} from "@oxlint/plugins"

import { decodeJsxEntities } from "../../vendor/_compat/jsx-entities.js"

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

// m-, mb-, me-, ml-, mr-, ms-, mt-, mx-, my- with a number or an arbitrary value
const MarginClassPattern = /!?-?m[belr-txy]?-(?:\d+|\[.+?\])/u

// `margin` itself, and every longhand: marginTop, marginBlockStart, marginInlineEnd, ...
const MarginStylePrefixes = [
    "marginTop",
    "marginLeft",
    "marginRight",
    "marginBlock",
    "marginBottom",
    "marginInline",
    "marginVertical",
    "marginHorizontal",
]

function extractStringsFromTemplateLiteral(node: ESTree.TemplateLiteral): string[] {
    const cooked = node.quasis
        .map((quasi) => quasi.value.cooked ?? "")
        .filter((text) => text !== "")
    return [...cooked, ...node.expressions.flatMap((expression) => extractStrings(expression))]
}

function extractStringsFromArguments(node: ESTree.CallExpression): string[] {
    return node.arguments
        .filter((argument) => argument.type === "Literal" || argument.type === "TemplateLiteral")
        .flatMap((argument) => extractStrings(argument))
}

/** The class-name strings an expression can evaluate to. */
function extractStrings(node: ESTree.Node): string[] {
    if (node.type === "BinaryExpression") {
        return node.operator === "+" ? [...extractStrings(node.left), ...extractStrings(node.right)] : []
    }
    if (node.type === "CallExpression") {
        return extractStringsFromArguments(node)
    }
    if (node.type === "ConditionalExpression") {
        return [...extractStrings(node.consequent), ...extractStrings(node.alternate)]
    }
    if (node.type === "Literal") {
        return typeof node.value === "string" ? [node.value] : []
    }
    if (node.type === "LogicalExpression") {
        return [...extractStrings(node.left), ...extractStrings(node.right)]
    }
    if (node.type === "TemplateLiteral") {
        return extractStringsFromTemplateLiteral(node)
    }
    return []
}

function hasMarginClassString(node: ESTree.Node): boolean {
    return extractStrings(node).some((text) => MarginClassPattern.test(text))
}

function hasMarginClass(node: ESTree.JSXAttribute): boolean {
    if (node.value?.type === "Literal") {
        // oxlint leaves HTML entities such as `&#109;` encoded in a JSX attribute's `value`.
        return MarginClassPattern.test(decodeJsxEntities(node.value.value))
    }
    if (node.value?.type === "JSXExpressionContainer") {
        return hasMarginClassString(node.value.expression)
    }
    return false
}

function getPropertyKey(prop: ESTree.ObjectProperty): null | string {
    if (prop.key.type === "Identifier") {
        return prop.key.name
    }
    if (prop.key.type === "Literal" && typeof prop.key.value === "string") {
        return prop.key.value
    }
    return null
}

function isMarginStyleKey(key: string): boolean {
    return key === "margin" || MarginStylePrefixes.some((prefix) => key.startsWith(prefix))
}

function objectProperties(node: ESTree.Node): ESTree.ObjectProperty[] {
    if (node.type !== "ObjectExpression") {
        return []
    }
    return node.properties.filter((prop) => prop.type === "Property")
}

function hasMarginStyle(node: ESTree.JSXAttribute): boolean {
    if (node.value?.type !== "JSXExpressionContainer") {
        return false
    }
    return objectProperties(node.value.expression).some((prop) => {
        const key = getPropertyKey(prop)
        return key !== null && isMarginStyleKey(key)
    })
}

function hasMarginInSpread(node: ESTree.JSXSpreadAttribute): boolean {
    return objectProperties(node.argument)
        .some((prop) => getPropertyKey(prop) === "className" && hasMarginClassString(prop.value))
}

function hasMargin(attr: ESTree.JSXAttributeItem): boolean {
    if (attr.type === "JSXAttribute") {
        return hasMarginClass(attr) || hasMarginStyle(attr)
    }
    return hasMarginInSpread(attr)
}

/** `export const Card = () => <div />` and `export default () => <div />`. */
function isExportedArrowFunction(node: ESTree.ArrowFunctionExpression): boolean {
    if (node.parent.type === "VariableDeclarator") {
        const declarationParent = node.parent.parent.parent
        return declarationParent?.type === "ExportNamedDeclaration"
            || declarationParent?.type === "ExportDefaultDeclaration"
    }
    return node.parent.type === "ExportDefaultDeclaration"
}

/** `export const element = <div />`. */
function isExportedDeclarator(node: ESTree.Node): boolean {
    return node.type === "VariableDeclarator" && node.parent.parent?.type === "ExportNamedDeclaration"
}

function analyzeJSX(node: ESTree.JSXElement | ESTree.JSXFragment, context: Context): void {
    // A fragment renders no element of its own to put the margin on.
    if (node.type === "JSXFragment") {
        return
    }
    const attr = node.openingElement.attributes.find((item) => hasMargin(item))

    if (attr !== undefined) {
        context.report({
            messageId: "noMarginOnRootJSX",
            node:      attr,
        })
    }
}

export const noMarginOnRootJSXRule = defineRule({
    create(context) {
        return {
            JSXElement(node) {
                const { parent } = node
                const isRoot = (parent.type === "ArrowFunctionExpression" && isExportedArrowFunction(parent))
                    || isExportedDeclarator(parent)

                if (isRoot) {
                    analyzeJSX(node, context)
                }
            },
            ReturnStatement(node) {
                if (node.argument?.type === "JSXElement" || node.argument?.type === "JSXFragment") {
                    analyzeJSX(node.argument, context)
                }
            },
        }
    },
    meta: {
        docs: {
            description: "Disallow margin classes or style props on the outermost JSX element",
        },
        messages: {
            noMarginOnRootJSX: "Avoid using margin on the outermost returned JSX element. This can cause layout issues. Apply margin to a child element instead.",
        },
        schema: [],
        type:   "problem",
    },
})
