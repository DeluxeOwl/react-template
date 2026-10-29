import {
    defineRule, type Scope, type ESTree, type SourceCode,
} from "@oxlint/plugins"

/*
 * Bans useState values, including imports/re-exports, member access, and aliases.
 * Reducer hooks, type-only references, and inert keys or strings are left alone.
 * No autofix: a reducer needs explicit transitions.
 */

const TypeOnlyContexts = new Set([
    "TSTypeQuery",
    "TSImportType",
    "TSTypeReference",
    "TSClassImplements",
    "TSInterfaceHeritage",
])

function getReferenceContext(node: ESTree.Node): ESTree.Node | null {
    let current = node.parent

    while (current !== null && (current.type === "MemberExpression" || current.type === "TSQualifiedName"
        || current.type === "JSXMemberExpression")) {
        current = current.parent
    }
    return current
}

function isTypeOnlyReference(node: ESTree.Node): boolean {
    return TypeOnlyContexts.has(getReferenceContext(node)?.type ?? "")
}

function isReadReference(node: ESTree.Node, sourceCode: SourceCode): boolean {
    for (let scope: null | Scope = sourceCode.getScope(node); scope !== null; scope = scope.upper) {
        const reference = scope.references.find((candidate) => candidate.identifier === node)

        if (reference !== undefined) {
            return reference.isRead()
        }
    }
    return false
}

function unwrapExpression(node: ESTree.Node): ESTree.Node {
    if (node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression" || node.type === "TSNonNullExpression"
        || node.type === "TSTypeAssertion" || node.type === "TSInstantiationExpression") {
        return unwrapExpression(node.expression)
    }
    return node
}

function isUseStateName(node: ESTree.Node): boolean {
    const name = unwrapExpression(node)

    return (name.type === "Identifier" && name.name === "useState")
        || (name.type === "Literal" && name.value === "useState")
        || (name.type === "TemplateLiteral" && name.expressions.length === 0 && name.quasis[0].value.cooked === "useState")
}

type PropertyNode = Extract<ESTree.Node, { type: "Property" }>

function isUseStateProperty(node: ESTree.MemberExpression | PropertyNode): boolean {
    const key = unwrapExpression(node.type === "MemberExpression" ? node.property : node.key)

    return !(node.computed && key.type === "Identifier") && isUseStateName(key)
}

export const noUseStateRule = defineRule({
    create(context) {
        function reportUseState(node: ESTree.Node): void {
            context.report({ messageId: "banned", node })
        }

        return {
            ExportSpecifier(node) {
                if (node.exportKind !== "type" && node.parent.type === "ExportNamedDeclaration"
                    && node.parent.exportKind !== "type" && isUseStateName(node.local)) {
                    reportUseState(node.local)
                }
            },
            Identifier(node) {
                if (node.name !== "useState" || node.parent.type === "ImportSpecifier" || node.parent.type === "ExportSpecifier"
                    || node.parent.type === "TSQualifiedName" || isTypeOnlyReference(node)) {
                    return
                }
                if (isReadReference(node, context.sourceCode)) {
                    reportUseState(node)
                }
            },
            ImportSpecifier(node) {
                if (node.importKind !== "type" && node.parent.type === "ImportDeclaration"
                    && node.parent.importKind !== "type" && isUseStateName(node.imported)) {
                    reportUseState(node.imported)
                }
            },
            JSXMemberExpression(node) {
                if (getReferenceContext(node)?.type === "JSXClosingElement") {
                    return
                }
                if (node.property.name === "useState") {
                    reportUseState(node.property)
                }
                if (node.object.type === "JSXIdentifier" && node.object.name === "useState") {
                    reportUseState(node.object)
                }
            },
            MemberExpression(node) {
                if (!isTypeOnlyReference(node) && isUseStateProperty(node)) {
                    reportUseState(node.property)
                }
            },
            Property(node) {
                if (node.parent.type === "ObjectPattern" && isUseStateProperty(node)) {
                    reportUseState(node.key)
                }
            },
            TSQualifiedName(node) {
                const parent = getReferenceContext(node)

                if (parent?.type !== "TSImportEqualsDeclaration") {
                    return
                }
                if (node.right.name === "useState") {
                    reportUseState(node.right)
                }
                if (node.left.type === "Identifier" && node.left.name === "useState") {
                    reportUseState(node.left)
                }
            },
        }
    },
    meta: {
        docs: {
            description: "Ban useState in favor of useReducer and exhaustive state machines",
        },
        messages: {
            banned: "This codebase bans useState, prefer useReducer and thinking in exhaustive state machines.",
        },
        schema: [],
        type:   "problem",
    },
})
