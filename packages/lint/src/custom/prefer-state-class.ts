import {
    type Node, defineRule, type ESTree,
} from "@oxlint/plugins"

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

type MessageId = "multipleParameters" | "noPrivateConstructor" | "noStateParameter" | "noStaticCreateMethod" | "wrongStateParameterName"

interface Problem {
    node:      Node
    messageId: MessageId
    data:      Record<string, string>
}

function problem(messageId: MessageId, at: Omit<Problem, "messageId">): Problem {
    return { ...at, messageId }
}

function findConstructor(node: ESTree.Class): ESTree.MethodDefinition | undefined {
    return node.body.body.find(
        (member): member is ESTree.MethodDefinition => member.type === "MethodDefinition" && member.kind === "constructor",
    )
}

// `private state: T` or `private state = value`
function parameterName(parameter: ESTree.FormalParameter): null | string {
    if (parameter.type === "Identifier") {
        return parameter.name
    }
    if (parameter.type === "AssignmentPattern" && parameter.left.type === "Identifier") {
        return parameter.left.name
    }
    return null
}

// Rules 1 to 3: a private constructor whose only parameter is `private state`.
function constructorProblem(constructor: ESTree.MethodDefinition, className: string): null | Problem {
    if (constructor.accessibility !== "private") {
        return problem("noPrivateConstructor", { data: { className }, node: constructor })
    }

    const { params } = constructor.value

    if (params.length > 1) {
        return problem("multipleParameters", { data: { className }, node: constructor })
    }

    const param = params.at(0)

    // Must be a parameter property: it has a modifier like `private`.
    if (param?.type !== "TSParameterProperty") {
        return problem("noStateParameter", { data: { className }, node: constructor })
    }

    const name = parameterName(param.parameter)

    return name === "state"
        ? null
        : problem("wrongStateParameterName", { data: { paramName: name ?? "undefined" }, node: param })
}

// Rule 4: a static method whose name starts with "create".
function createMethodProblem(node: ESTree.Class, className: string): null | Problem {
    const hasStaticCreateMethod = node.body.body.some((member) => member.type === "MethodDefinition"
        && member.kind === "method"
        && member.static
        && member.key.type === "Identifier"
        && member.key.name.startsWith("create"))

    return hasStaticCreateMethod ? null : problem("noStaticCreateMethod", { data: { className }, node })
}

export const preferStateClassRule = defineRule({
    create(context) {
        return {
            ClassDeclaration(node) {
                const constructor = findConstructor(node)

                // Only classes with a constructor are checked.
                if (constructor === undefined) {
                    return
                }

                const className = node.id?.name ?? "<anonymous>"
                const found = constructorProblem(constructor, className) ?? createMethodProblem(node, className)

                if (found !== null) {
                    context.report(found)
                }
            },
        }
    },
    meta: {
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
})
