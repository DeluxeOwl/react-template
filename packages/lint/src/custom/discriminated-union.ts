import { TSESTree, ESLintUtils } from "@typescript-eslint/utils"

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

function hasUnionType(node: TSESTree.TypeElement): boolean {
    if (node.type !== TSESTree.AST_NODE_TYPES.TSPropertySignature) {
        return false
    }
    return node.typeAnnotation?.typeAnnotation.type === TSESTree.AST_NODE_TYPES.TSUnionType
}

function isOptionalProperty(node: TSESTree.TypeElement): boolean {
    return node.type === TSESTree.AST_NODE_TYPES.TSPropertySignature && node.optional
}

export const preferDiscriminatedUnionRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/react-template/eslint-rules#${name}`,
)({
    create(context) {
        function analyzeMembers(members: TSESTree.TypeElement[], reportNode: TSESTree.Node): void {
            let unionTypeCount = 0
            let optionalPropertyCount = 0

            for (const member of members) {
                if (member.type === TSESTree.AST_NODE_TYPES.TSPropertySignature) {
                    if (hasUnionType(member)) {
                        unionTypeCount++
                    }
                    if (isOptionalProperty(member)) {
                        optionalPropertyCount++
                    }
                }
            }

            const propertyCount = 2
            if (unionTypeCount >= 1 && optionalPropertyCount >= propertyCount) {
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
    defaultOptions: [],
    meta:           {
        docs: {
            description: "Suggest using discriminated unions when a type has union properties and multiple optional properties",
        },
        messages: {
            preferDiscriminatedUnion: "This type has a union type property and multiple optional properties. Consider refactoring to a discriminated union for better type safety.",
        },
        schema: [],
        type:   "suggestion",
    },
    name: "prefer-discriminated-union",
})
