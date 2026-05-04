import {
    it, expect, describe,
} from "vitest"

import { expectResultFailure, expectResultSuccess } from "../test-helpers/result-assertions"
import {
    Todo, NameLengthError, isValidTodoPublicId, generateTodoPublicId, InvalidPublicIdError,
} from "./todo"

describe("creating a todo", () => {
    describe("given a valid name string", () => {
        describe("when calling Todo.create with that name", () => {
            it("then it should return a Todo instance with a valid public id", () => {
                expect.hasAssertions()

                // GIVEN
                const name = "hello"

                // WHEN
                const todoEntry = expectResultSuccess(Todo.create(name))

                // THEN
                expect(todoEntry.toDTO().name).toBe("hello")
                expect(isValidTodoPublicId(todoEntry.toDTO().id)).toBe(true)
            })
        })
    })

    describe("given a valid name and a valid public id", () => {
        describe("when calling Todo.create with both", () => {
            it("then it should return a Todo with the provided public id", () => {
                expect.hasAssertions()

                // GIVEN
                const name = "hello"
                const publicId = generateTodoPublicId()

                // WHEN
                const todoEntry = expectResultSuccess(Todo.create(name, publicId))

                // THEN
                expect(todoEntry.toDTO().id).toBe(publicId)
                expect(todoEntry.toDTO().name).toBe("hello")
            })
        })
    })

    describe("given a valid name and an invalid public id", () => {
        describe("when calling Todo.create with the invalid id", () => {
            it("then it should return an InvalidPublicIdError", () => {
                expect.hasAssertions()

                // GIVEN
                const name = "hello"
                const invalidId = "bad_id"

                // WHEN
                const result = Todo.create(name, invalidId)

                // THEN
                expectResultFailure(result, InvalidPublicIdError)
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
                expectResultFailure(result, NameLengthError)
            })
        })
    })
})

describe("generating a todo public id", () => {
    describe("when calling generateTodoPublicId", () => {
        it("then it should return a valid prefixed base62 id", () => {
            expect.hasAssertions()

            // WHEN
            const id = generateTodoPublicId()

            // THEN
            expect(id).toMatch(/^todo_[\dA-Za-z]{22}$/)
            expect(isValidTodoPublicId(id)).toBe(true)
        })
    })
})

describe("validating a todo public id", () => {
    describe("given a correctly formatted id", () => {
        describe("when calling isValidTodoPublicId", () => {
            it("then it should return true", () => {
                expect.hasAssertions()

                // GIVEN
                const id = generateTodoPublicId()

                // WHEN
                const result = isValidTodoPublicId(id)

                // THEN
                expect(result).toBe(true)
            })
        })
    })

    describe("given an id with wrong prefix", () => {
        describe("when calling isValidTodoPublicId", () => {
            it("then it should return false", () => {
                expect.hasAssertions()

                // GIVEN
                const id = "user_0123456789ABCDEFGHIJkl"

                // WHEN
                const result = isValidTodoPublicId(id)

                // THEN
                expect(result).toBe(false)
            })
        })
    })

    describe("given an id with wrong length", () => {
        describe("when calling isValidTodoPublicId", () => {
            it("then it should return false", () => {
                expect.hasAssertions()

                // GIVEN
                const id = "todo_short"

                // WHEN
                const result = isValidTodoPublicId(id)

                // THEN
                expect(result).toBe(false)
            })
        })
    })
})
