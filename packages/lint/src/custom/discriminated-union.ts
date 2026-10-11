import {
    type Node, defineRule, type ESTree,
} from "@oxlint/plugins"

/*
 * ----------------------------------------------------------------------------
 * Rule: prefer-discriminated-union
 * ----------------------------------------------------------------------------
 * Flags types with a union property and 2+ optional properties.
 * These patterns often indicate a need for discriminated unions.
 *
 * Example that MATCHES (bad - union + multiple optionals):
 *   interface Shape {
 *     kind: "circle" | "square";
 *     radius?: number;
 *     sideLength?: number;
 *   }
 *
 * Example that does NOT match (no union property):
 *   interface User {
 *     name?: string;
 *     age?: number;
 *   }
 *
 * Example that does NOT match (only one optional):
 *   interface Config {
 *     mode: "dev" | "prod";
 *     debug?: boolean;
 *   }
 * ----------------------------------------------------------------------------
 */

const minOptionalProperties = 2

function hasUnionType(member: ESTree.TSSignature): boolean {
    return member.type === "TSPropertySignature" && member.typeAnnotation?.typeAnnotation.type === "TSUnionType"
}

function isOptionalProperty(member: ESTree.TSSignature): boolean {
    return member.type === "TSPropertySignature" && member.optional
}

export const preferDiscriminatedUnionRule = defineRule({
    create(context) {
        function analyzeMembers(members: ESTree.TSSignature[], reportNode: Node): void {
            const hasUnion = members.some((member) => hasUnionType(member))
            const optionalCount = members.filter((member) => isOptionalProperty(member)).length

            if (hasUnion && optionalCount >= minOptionalProperties) {
                context.report({
                    messageId: "preferDiscriminatedUnion",
                    node:      reportNode,
                })
            }
        }

        return {
            TSInterfaceDeclaration(node) {
                analyzeMembers(node.body.body, node)
            },
            TSTypeLiteral(node) {
                analyzeMembers(node.members, node)
            },
        }
    },
    meta: {
        docs: {
            description: "Suggest using discriminated unions when a type has union properties and multiple optional properties",
        },
        messages: {
            preferDiscriminatedUnion: "This type has a union type property and multiple optional properties. Consider refactoring to a discriminated union for better type safety.",
        },
        schema: [],
        type:   "suggestion",
    },
})
