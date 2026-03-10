import { Result } from "@praha/byethrow"
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
                const todoEntry = Result.unwrap(Todo.create(name))

                // THEN
                expect(todoEntry.toDTO().name).toBe("hello")
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
                expect(() => Result.unwrap(result)).toThrowError(NameLengthError)
            })
        })
    })
})
