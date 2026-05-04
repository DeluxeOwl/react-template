// oxlint-disable max-statements
/* eslint-disable sweepit/complexity */
import { TSESTree, ESLintUtils } from "@typescript-eslint/utils"

/*
 * ----------------------------------------------------------------------------
 * Rule: prefer-state-class
 * ----------------------------------------------------------------------------
 * Enforce classes that have a constructor to have:
 *   1. A private constructor
 *   2. A single private parameter called "state" that is an object type
 *   3. A static method that starts with "create"
 *
 * This pattern is useful for creating immutable value objects with a single
 * source of truth.
 *
 * Note: Classes without a constructor are allowed (valid).
 *
 * Examples that MATCH (good):
 *   export class Bodo {
 *       private constructor(
 *           private state: {
 *               done: boolean
 *               id: BodoID
 *               name: string
 *           },
 *       ) {}
 *
 *       static create(props: { done: boolean; id: BodoID; name: string }) {
 *           return new Bodo({ ...props })
 *       }
 *   }
 *
 *   class NoConstructor {}  // Fine - no constructor
 *
 * Examples that do NOT match (bad):
 *   class Bar { constructor() {} }                  // not private
 *   class Baz { private constructor() {} }          // no state parameter
 *   class Qux { private constructor(private x: number) {} } // wrong param name
 *   class Abc { private constructor(private state: number) {} } // state not object
 *   class Def { private constructor(private state: {}, public foo: string) {} } // multiple params
 *   class Ghi { private constructor(private state: {}) {} } // no static create method
 * ----------------------------------------------------------------------------
 */

export const preferStateClassRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/react-template/eslint-rules#${name}`,
)<[], "multipleParameters" | "noPrivateConstructor" | "noStateParameter" | "noStaticCreateMethod" | "wrongStateParameterName">({
    create(context) {
        return {
            ClassDeclaration(node: TSESTree.ClassDeclaration) {
                const className = node.id?.name ?? "<anonymous>"
                const constructor = node.body.body.find(
                    (member): member is TSESTree.MethodDefinition =>
                        member.type === TSESTree.AST_NODE_TYPES.MethodDefinition
                        && member.kind === "constructor",
                )

                // If there's no constructor at all, that's fine - we only check
                // classes that have a constructor
                if (!constructor) {
                    return
                }

                // Rule 1: Constructor must be private
                if (!constructor.accessibility || constructor.accessibility !== "private") {
                    context.report({
                        data:      { className },
                        messageId: "noPrivateConstructor",
                        node:      constructor,
                    })
                    return
                }

                // Check if constructor has parameters
                const params = constructor.value.params

                // Rule 2: Must have exactly one parameter
                if (params.length === 0) {
                    context.report({
                        data:      { className },
                        messageId: "noStateParameter",
                        node:      constructor,
                    })
                    return
                }

                if (params.length > 1) {
                    context.report({
                        data:      { className },
                        messageId: "multipleParameters",
                        node:      constructor,
                    })
                    return
                }

                const param = params[0]

                // Must be a parameter property (has accessiblity modifier like `private`)
                if (
                    param.type !== TSESTree.AST_NODE_TYPES.TSParameterProperty
                ) {
                    context.report({
                        data:      { className },
                        messageId: "noStateParameter",
                        node:      constructor,
                    })
                    return
                }

                const parameterProperty = param

                // Get the parameter name - handle both Identifier and AssignmentPattern
                // For: `private state: Type` -> parameter is Identifier with name "state"
                // For: `private state = default` -> parameter is AssignmentPattern with left as Identifier
                let paramName: string | undefined
                if (parameterProperty.parameter.type === TSESTree.AST_NODE_TYPES.Identifier) {
                    paramName = (parameterProperty.parameter).name
                } else {
                    const left = (parameterProperty.parameter as TSESTree.AssignmentPattern).left
                    if (left.type === TSESTree.AST_NODE_TYPES.Identifier) {
                        paramName = left.name
                    }
                }

                // Rule 3: Parameter must be named "state"
                if (paramName !== "state") {
                    context.report({
                        data:      { paramName: paramName ?? "undefined" },
                        messageId: "wrongStateParameterName",
                        node:      parameterProperty,
                    })
                    return
                }

                // Rule 4: Must have a static method starting with "create"
                const hasStaticCreateMethod = node.body.body.some(
                    (member): member is TSESTree.MethodDefinition =>
                        member.type === TSESTree.AST_NODE_TYPES.MethodDefinition
                        && member.kind === "method"
                        && member.static
                        && member.key.type === TSESTree.AST_NODE_TYPES.Identifier
                        && member.key.name.startsWith("create"),
                )

                if (!hasStaticCreateMethod) {
                    context.report({
                        data:      { className },
                        messageId: "noStaticCreateMethod",
                        node,
                    })
                }
            },
        }
    },
    defaultOptions: [],
    meta:           {
        docs: {
            description:
                "Enforce classes with a private constructor to have a static 'create' method and a private 'state' parameter that is an object type.",
        },
        messages: {
            multipleParameters:
                "Constructor must have exactly one parameter (the 'state' parameter).",
            noPrivateConstructor:
                "Class '{{className}}' must have a private constructor.",
            noStateParameter:
                "Class '{{className}}' constructor must have a private 'state' parameter.",
            noStaticCreateMethod:
                "Class '{{className}}' must have a static method starting with 'create'.",
            wrongStateParameterName:
                "Constructor parameter must be named 'state', but found '{{paramName}}'.",
        },
        schema: [],
        type:   "problem",
    },
    name: "prefer-state-class",
})
