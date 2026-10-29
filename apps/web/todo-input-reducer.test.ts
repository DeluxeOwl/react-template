import {
    it, expect, describe,
} from "vitest"

import { todoInputReducer } from "./todo-input-reducer.ts"

describe("todo input state", () => {
    describe("given an input containing text", () => {
        describe("when its text changes", () => {
            it("then it replaces the previous text without trimming", () => {
                expect.hasAssertions()

                // GIVEN
                const action = { text: "  buy bread  ", type: "textChanged" } as const

                // WHEN
                const text = todoInputReducer("buy milk", action)

                // THEN
                expect(text).toBe("  buy bread  ")
            })
        })

        describe("when the text is deleted", () => {
            it("then it clears the input", () => {
                expect.hasAssertions()

                // GIVEN
                const action = { text: "", type: "textChanged" } as const

                // WHEN
                const text = todoInputReducer("buy milk", action)

                // THEN
                expect(text).toBe("")
            })
        })

        describe("when the input is submitted", () => {
            it("then it clears the input for the next todo", () => {
                expect.hasAssertions()

                // GIVEN
                const action = { type: "submitted" } as const

                // WHEN
                const text = todoInputReducer("buy milk", action)

                // THEN
                expect(text).toBe("")
            })
        })
    })
})
