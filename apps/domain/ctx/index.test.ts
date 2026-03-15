import {
    it, expect, describe,
} from "vitest"

import { CancelledError, makeCancellable } from "./index"

describe(makeCancellable, () => {
    describe("given a promise and an aborted signal", () => {
        describe("when calling makeCancellable with them", () => {
            it("then it should reject with a CancelledError", async () => {
                expect.hasAssertions()

                // GIVEN
                const controller = new AbortController()
                controller.abort("test abort")
                const promise = Promise.resolve("success")

                // WHEN
                const cancellable = makeCancellable(promise, controller.signal)

                // THEN
                await expect(cancellable).rejects.toBeInstanceOf(CancelledError)
            })
        })
    })

    describe("given a promise and a signal that aborts while the promise is pending", () => {
        describe("when calling makeCancellable and the signal aborts before resolution", () => {
            it("then it should reject with a CancelledError", async () => {
                expect.hasAssertions()

                // GIVEN
                const controller = new AbortController()
                const promise = new Promise<string>((resolve) => {
                    setTimeout(() => {
                        resolve("success")
                    }, 100)
                })

                // WHEN
                const cancellable = makeCancellable(promise, controller.signal)
                controller.abort("aborted mid-flight")

                // THEN
                await expect(cancellable).rejects.toBeInstanceOf(CancelledError)
            })
        })
    })
})
