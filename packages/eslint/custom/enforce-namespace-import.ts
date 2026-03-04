import { camelCase } from "change-case"
import { TSESTree, ESLintUtils } from "@typescript-eslint/utils"

/*
 * ----------------------------------------------------------------------------
 * Rule: enforce-namespace-import
 * ----------------------------------------------------------------------------
 * For specified scoped packages, all imports must:
 *   1. Use a namespace import (`import * as foo from "..."`)
 *   2. Use a local name that is the camelCase of the last path segment of the
 *      module specifier.
 *
 * Configurable via the `packages` option (array of package-scope strings,
 * e.g. ["@react-template"]).
 *
 * Examples that MATCH (bad):
 *   import { contract } from "@react-template/domain/todos"
 *   import * as foo from "@react-template/domain/todos"          // wrong name
 *   import * as todosADAPTER from "@react-template/todos-adapter"
 *   import defaultExport from "@react-template/domain/todos"
 *
 * Examples that do NOT match (good):
 *   import * as todos from "@react-template/domain/todos"
 *   import * as todosAdapters from "@react-template/todos-adapters"
 *   import * as somethingElse from "@react-template/todos/something_else"
 *   import { anything } from "some-other-package"                // not in scope
 * ----------------------------------------------------------------------------
 */

export type Options = [{ packages: string[] }]

/**
 * Derive the expected camelCase local name from the last path segment of a
 * module specifier.
 *
 * "@react-template/domain/todos"    → "todos"
 * "@react-template/todos-adapters"  → "todosAdapters"
 * "@react-template/todos/something_else" → "somethingElse"
 */
function expectedNameFor(source: string): string {
    const segments = source.split("/")
    const last = segments.at(-1) ?? source
    return camelCase(last)
}

function isMatchedPackage(source: string, packages: string[]): boolean {
    return packages.some((pkg) => source.startsWith(`${pkg}/`) || source === pkg)
}

export const enforceNamespaceImportRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/react-template/eslint-rules#${name}`,
)<Options, "mustBeNamespace" | "wrongLocalName">({
    create(context) {
        const [{ packages }] = context.options

        return {
            ImportDeclaration(node: TSESTree.ImportDeclaration) {
                const source = node.source.value

                if (!isMatchedPackage(source, packages)) {
                    return
                }

                // Must be a namespace import (import * as foo from "...")
                const namespaceSpecifier = node.specifiers.find(
                    (s) => s.type === TSESTree.AST_NODE_TYPES.ImportNamespaceSpecifier,
                )

                const hasOnlyNamespace
                    = node.specifiers.length === 1 && namespaceSpecifier !== undefined

                if (!hasOnlyNamespace) {
                    context.report({
                        data: {
                            expected: expectedNameFor(source),
                            source,
                        },
                        messageId: "mustBeNamespace",
                        node,
                    })
                    return
                }

                // The local name must match camelCase(last segment)
                const localName = namespaceSpecifier.local.name
                const expected = expectedNameFor(source)

                if (localName !== expected) {
                    context.report({
                        data: {
                            expected,
                            localName,
                            source,
                        },
                        messageId: "wrongLocalName",
                        node:      namespaceSpecifier,
                    })
                }
            },
        }
    },
    defaultOptions: [{ packages: [] }],
    meta:           {
        docs: {
            description:
                "Enforce namespace imports (`import * as name`) with a camelCase name matching the last path segment, for specified scoped packages.",
        },
        messages: {
            mustBeNamespace:
                "Imports from '{{source}}' must use a namespace import: `import * as {{expected}} from '{{source}}'`.",
            wrongLocalName:
                "Namespace import from '{{source}}' must be named '{{expected}}', but got '{{localName}}'.",
        },
        schema: [
            {
                additionalProperties: false,
                properties:           {
                    packages: {
                        items: { type: "string" },
                        type:  "array",
                    },
                },
                required: ["packages"],
                type:     "object",
            },
        ],
        type: "problem",
    },
    name: "enforce-namespace-import",
})
