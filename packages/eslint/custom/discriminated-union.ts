import type { Rule } from "eslint"

interface TypeAnnotation {
    type:            string
    typeAnnotation?: TypeAnnotation
}

interface TypeMember {
    optional?:       boolean
    type:            string
    typeAnnotation?: TypeAnnotation
}

interface TypeBody {
    body: TypeMember[]
}

interface InterfaceNode {
    body: TypeBody
}

interface TypeLiteralNode {
    members: TypeMember[]
}

/**
 * Custom ESLint rule to suggest using discriminated unions when a type/interface
 * has at least one union type property and at least two optional properties.
 */
function hasUnionType(node: TypeMember): boolean {
    return node.typeAnnotation?.typeAnnotation?.type === "TSUnionType"
}

function isOptionalProperty(node: TypeMember): boolean {
    return node.type === "TSPropertySignature" && node.optional === true
}

export const preferDiscriminatedUnionRule: Rule.RuleModule = {
    create(context) {
        function analyzeMembers(members: TypeMember[], reportNode: Rule.Node): void {
            let unionTypeCount = 0
            let optionalPropertyCount = 0

            for (const member of members) {
                if (member.type === "TSPropertySignature") {
                    if (hasUnionType(member)) {
                        unionTypeCount++
                    }
                    if (isOptionalProperty(member)) {
                        optionalPropertyCount++
                    }
                }
            }

            if (unionTypeCount >= 1 && optionalPropertyCount >= 2) {
                context.report({
                    message: "This type has a union type property and multiple optional properties. Consider refactoring to a discriminated union for better type safety.",
                    node:    reportNode,
                })
            }
        }

        return {
            TSInterfaceDeclaration(node: Rule.Node) {
                const interfaceNode = node as unknown as InterfaceNode
                analyzeMembers(interfaceNode.body.body, node)
            },
            TSTypeLiteral(node: Rule.Node) {
                const typeLiteralNode = node as unknown as TypeLiteralNode
                analyzeMembers(typeLiteralNode.members, node)
            },
        }
    },
    meta: {
        docs: {
            description: "Suggest using discriminated unions when a type has union properties and multiple optional properties",
        },
        schema: [],
        type:   "suggestion",
    },
}
