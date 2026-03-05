/* eslint-disable vitest/require-hook */
import tseslint from "typescript-eslint"
import { it, afterAll, describe } from "vitest"
import { RuleTester } from "@typescript-eslint/rule-tester"

import { preferStateClassRule } from "./prefer-state-class"

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
    languageOptions: {
        parser:        tseslint.parser,
        parserOptions: {
            ecmaVersion: 2020,
            sourceType:  "module",
        },
    },
})

ruleTester.run("prefer-state-class", preferStateClassRule, {
    invalid: [
        // Constructor exists but is not private
        {
            code:   `class Foo { constructor() {} }`,
            errors: [{ messageId: "noPrivateConstructor" }],
        },
        // Constructor is public
        {
            code:   `class Foo { public constructor() {} }`,
            errors: [{ messageId: "noPrivateConstructor" }],
        },
        // Constructor is protected
        {
            code:   `class Foo { protected constructor() {} }`,
            errors: [{ messageId: "noPrivateConstructor" }],
        },
        // Private constructor but no parameters
        {
            code:   `class Foo { private constructor() {} }`,
            errors: [{ messageId: "noStateParameter" }],
        },
        // Private constructor with a parameter but it's not private
        {
            code:   `class Foo { private constructor(state: { done: boolean }) {} }`,
            errors: [{ messageId: "noStateParameter" }],
        },
        // Private constructor with state but wrong name
        {
            code:   `class Foo { private constructor(private data: { done: boolean }) {} }`,
            errors: [{ messageId: "wrongStateParameterName" }],
        },
        // Private constructor with state but wrong type (not an object)
        {
            code:   `class Foo { private constructor(private state: string) {} }`,
            errors: [{ messageId: "stateNotObject" }],
        },
        // Private constructor with state but type is a primitive
        {
            code:   `class Foo { private constructor(private state: number) {} }`,
            errors: [{ messageId: "stateNotObject" }],
        },
        // Private constructor with state but type is an array
        {
            code:   `class Foo { private constructor(private state: string[]) {} }`,
            errors: [{ messageId: "stateNotObject" }],
        },
        // Private constructor with multiple parameters
        {
            code:   `class Foo { private constructor(private state: { done: boolean }, private other: string) {} }`,
            errors: [{ messageId: "multipleParameters" }],
        },
        // Private constructor with state but no type annotation
        {
            code:   `class Foo { private constructor(private state) {} }`,
            errors: [{ messageId: "stateNotObject" }],
        },
        // Private constructor with state but state type is a type reference (not object literal)
        {
            code:   `type State = { done: boolean }; class Foo { private constructor(private state: State) {} }`,
            errors: [{ messageId: "stateNotObject" }],
        },
        // Private constructor with valid state but no static create method
        {
            code:   `class Foo { private constructor(private state: {}) {} }`,
            errors: [{ messageId: "noStaticCreateMethod" }],
        },
    ],
    valid: [
        // No constructor at all is fine
        {
            code: `class Foo {}`,
        },
        // Extends expression with no constructor
        {
            code: `
                export class NameLengthError extends errore.createTaggedError({
                    extends: TodoError,
                    message: "name length must be less than $length",
                    name:    "NameLengthError",
                }) {}
            `,
        },
        // Minimal valid example with static create method
        {
            code: `
                class Todo {
                    private constructor(
                        private state: {
                            done: boolean
                        },
                    ) {}

                    static create(props: { done: boolean }) {
                        return new Todo({ done: props.done })
                    }
                }
            `,
        },
        // Full valid example from the user
        {
            code: `
                export class Todo {
                    private constructor(
                        private state: {
                            done: boolean
                            id:   TodoID
                            name: string
                        },
                    ) {}

                    static create(props: { done: boolean; id: TodoID; name: string }) {
                        return new Todo({ ...props })
                    }
                }
            `,
        },
        // Valid with different object properties
        {
            code: `
                class User {
                    private constructor(
                        private state: {
                            name: string
                            email: string
                            age: number
                            tags: string[]
                        },
                    ) {}

                    static create(data: { name: string; email: string; age: number; tags: string[] }) {
                        return new User({ ...data })
                    }
                }
            `,
        },
        // Valid with nested objects
        {
            code: `
                class Config {
                    private constructor(
                        private state: {
                            database: {
                                host: string
                                port: number
                            }
                            cache: {
                                enabled: boolean
                                ttl: number
                            }
                        },
                    ) {}

                    static create(cfg: { database: { host: string; port: number }; cache: { enabled: boolean; ttl: number } }) {
                        return new Config({ ...cfg })
                    }
                }
            `,
        },
        // Valid with empty object type
        {
            code: `
                class Empty {
                    private constructor(
                        private state: {},
                    ) {}

                    static create() {
                        return new Empty({})
                    }
                }
            `,
        },
        // Valid with static method name that starts with "create" (more than just "create")
        {
            code: `
                class Todo2 {
                    private constructor(
                        private state: { done: boolean },
                    ) {}

                    static createTodo(props: { done: boolean }) {
                        return new Todo2({ done: props.done })
                    }
                }
            `,
        },
    ],
})
