
import { it, expect, describe } from "vitest"

import { Todo, NameLengthError } from "./todo"

describe("creating a todo", () => {
    describe("given a valid name", () => {
        it("should return a Todo instance", () => {
            expect.hasAssertions()

            const name = "hello"
            const result = Todo.create(name)

            expect(result).toBeInstanceOf(Todo)
        })
    })

    describe("given an empty name", () => {
        it("should return a NameLengthError", () => {
            expect.hasAssertions()

            const name = ""
            const result = Todo.create(name)

            expect(result).toBeInstanceOf(NameLengthError)
        })
    })
})
