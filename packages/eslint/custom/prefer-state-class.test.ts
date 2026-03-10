/* eslint-disable vitest/require-hook */
import tseslint from "typescript-eslint"
import {
    it, afterAll, describe,
} from "vitest"
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
        // Private constructor with multiple parameters
        {
            code:   `class Foo { private constructor(private state: { done: boolean }, private other: string) {} }`,
            errors: [{ messageId: "multipleParameters" }],
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
                export class NameLengthError extends something.createTaggedError({
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
        // Valid with state as a primitive type (string)
        {
            code: `
                class ValueString {
                    private constructor(
                        private state: string,
                    ) {}

                    static create(value: string) {
                        return new ValueString(value)
                    }
                }
            `,
        },
        // Valid with state as a primitive type (number)
        {
            code: `
                class ValueNumber {
                    private constructor(
                        private state: number,
                    ) {}

                    static create(value: number) {
                        return new ValueNumber(value)
                    }
                }
            `,
        },
        // Valid with state as an array
        {
            code: `
                class Items {
                    private constructor(
                        private state: string[],
                    ) {}

                    static create(items: string[]) {
                        return new Items(items)
                    }
                }
            `,
        },
        // Valid with state as a type reference
        {
            code: `
                type State = { done: boolean };
                class Todo {
                    private constructor(
                        private state: State,
                    ) {}

                    static create(props: State) {
                        return new Todo(props)
                    }
                }
            `,
        },
        // Valid with state having no type annotation
        {
            code: `
                class AnyState {
                    private constructor(
                        private state,
                    ) {}

                    static create(value: any) {
                        return new AnyState(value)
                    }
                }
            `,
        },
    ],
})
