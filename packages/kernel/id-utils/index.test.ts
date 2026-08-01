import {
    it, expect, describe,
} from "vitest"

import { uuidToBase62, createPublicIdCodec } from "./index"

describe(uuidToBase62, () => {
    describe("given the nil uuid", () => {
        describe("when calling uuidToBase62 with it", () => {
            it("then it should return 22 padded zeroes", () => {
                expect.hasAssertions()

                // GIVEN
                const uuid = "00000000-0000-0000-0000-000000000000"

                // WHEN
                const result = uuidToBase62(uuid)

                // THEN
                expect(result).toBe("0".repeat(22))
            })
        })
    })

    describe("given a random uuid", () => {
        describe("when calling uuidToBase62 with it", () => {
            it("then it should return 22 base62 chars", () => {
                expect.hasAssertions()

                // GIVEN
                const uuid = crypto.randomUUID()

                // WHEN
                const result = uuidToBase62(uuid)

                // THEN
                expect(result).toMatch(/^[\dA-Za-z]{22}$/)
            })
        })
    })
})

describe(createPublicIdCodec, () => {
    describe("given a codec for the prefix 'user'", () => {
        describe("when calling generate", () => {
            it("then it should return a prefixed base62 id", () => {
                expect.hasAssertions()

                // GIVEN
                const codec = createPublicIdCodec("user")

                // WHEN
                const id = codec.generate()

                // THEN
                expect(id).toMatch(/^user_[\dA-Za-z]{22}$/)
                expect(codec.isValid(id)).toBe(true)
            })
        })

        describe("when calling generate twice", () => {
            it("then it should return two different ids", () => {
                expect.hasAssertions()

                // GIVEN
                const codec = createPublicIdCodec("user")

                // WHEN
                const first = codec.generate()
                const second = codec.generate()

                // THEN
                expect(first).not.toBe(second)
            })
        })

        describe("when calling isValid with an id of another prefix", () => {
            it("then it should return false", () => {
                expect.hasAssertions()

                // GIVEN
                const codec = createPublicIdCodec("user")
                const id = createPublicIdCodec("todo").generate()

                // WHEN
                const result = codec.isValid(id)

                // THEN
                expect(result).toBe(false)
            })
        })

        describe("when calling isValid with an id of the wrong length", () => {
            it("then it should return false", () => {
                expect.hasAssertions()

                // GIVEN
                const codec = createPublicIdCodec("user")

                // WHEN
                const result = codec.isValid("user_short")

                // THEN
                expect(result).toBe(false)
            })
        })
    })
})
