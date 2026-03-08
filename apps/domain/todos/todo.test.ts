import {
    it, expect, describe,
} from "vitest"

import { Todo, NameLengthError } from "./todo"

describe("creating a todo", () => {
    describe("given a valid name string", () => {
        describe("when calling Todo.create with that name", () => {
            it("then it should return a Todo instance", () => {
                expect.hasAssertions()

                // GIVEN
                const name = "hello"

                // WHEN
                const result = Todo.create(name)

                // THEN
                expect(result).toBeInstanceOf(Todo)
                expect((result as Todo).toDTO().name).toBe("hello")
            })
        })
    })

    describe("given an empty name string", () => {
        describe("when calling Todo.create with that empty string", () => {
            it("then it should return a NameLengthError", () => {
                expect.hasAssertions()

                // GIVEN
                const name = ""

                // WHEN
                const result = Todo.create(name)

                // THEN
                expect(result).toBeInstanceOf(NameLengthError)
            })
        })
    })
})
