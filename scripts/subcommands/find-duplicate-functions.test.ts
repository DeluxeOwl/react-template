import {
    it, expect, describe,
} from "vitest"

import { collectFunctions } from "./find-duplicate-functions"

describe("collecting named functions", () => {
    describe("given declarations and arrow functions, typed and untyped", () => {
        describe("when collecting the functions of a .tsx file", () => {
            it("then it finds each named function with a body, and no other functions", () => {
                expect.hasAssertions()

                // GIVEN
                const source = [
                    "export function typed(a: number): number { return a }",
                    "async function* stream<T>(items: T[]): AsyncGenerator<T> { yield* items }",
                    "declare function ambient(): void",
                    "const arrow = <T,>(a: T): T => a, other = async (b: string) => b",
                    "const Card = (): React.ReactNode => <div />",
                    "const expression = function named() { return 1 }",
                    "class Box { method(): void {} }",
                ].join("\n")

                // WHEN
                const functions = collectFunctions("card.tsx", source)

                // THEN
                expect(functions.map(({ line, name }) => `${name}:${line}`)).toStrictEqual(["typed:1", "stream:2", "arrow:4", "other:4", "Card:5"])
            })
        })
    })
})
