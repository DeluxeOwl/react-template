/* oxlint-disable vitest-js/require-hook -- RuleTester.run registers its own describe and it blocks */
import { createRuleTester } from "./rule-tester.ts"
import { preferDiscriminatedUnionRule } from "./discriminated-union.ts"

const ruleTester = createRuleTester("ts")

ruleTester.run("prefer-discriminated-union", preferDiscriminatedUnionRule, {
    invalid: [
        // A union property and two optional properties.
        {
            code:   `interface Shape { kind: "circle" | "square"; radius?: number; sideLength?: number }`,
            errors: [{ messageId: "preferDiscriminatedUnion" }],
        },
        // The same as a type literal.
        {
            code:   `type Shape = { kind: "circle" | "square"; radius?: number; sideLength?: number }`,
            errors: [{ messageId: "preferDiscriminatedUnion" }],
        },
        // The optional properties can be the union ones.
        {
            code:   `interface Filter { status?: "open" | "closed"; owner?: string }`,
            errors: [{ messageId: "preferDiscriminatedUnion" }],
        },
    ],
    valid: [
        // No union property.
        { code: `interface User { name?: string; age?: number }` },
        // Only one optional property.
        { code: `interface Config { mode: "dev" | "prod"; debug?: boolean }` },
        // Methods and index signatures don't count.
        { code: `interface Api { mode: "a" | "b"; get?(): void; [key: string]: unknown }` },
        // Already a discriminated union.
        { code: `type Shape = { kind: "circle"; radius: number } | { kind: "square"; sideLength: number }` },
    ],
})
