import { ErrorFactory } from "@praha/error-factory"

export class CancelledError extends ErrorFactory({
    message: "operation was cancelled",
    name:    "CancelledError",
}) {}

export class Context {
    signal?: AbortSignal

    // eslint-disable-next-line custom/prefer-state-class
    private constructor(params?: {
        signal?: AbortSignal
    }) {
        this.signal = params?.signal
    }

    static create(): Context {
        return new Context()
    }

    static withSignal(signal?: AbortSignal): Context {
        return new Context({ signal })
    }
}

export function makeCancellable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
    if (!signal) {
        return promise
    }

    const getCancelledError = (): CancelledError => new CancelledError({
        cause: signal.reason,
    })

    if (signal.aborted) {
        // eslint-disable-next-line no-restricted-syntax
        return Promise.reject(getCancelledError())
    }

    return new Promise<T>((resolve, reject) => {
        const abortHandler = (): void => {
            cleanup()
            reject(getCancelledError())
        }

        const cleanup = (): void => {
            signal.removeEventListener("abort", abortHandler)
        }

        signal.addEventListener("abort", abortHandler, { once: true })

        promise.then(
            (value) => {
                cleanup()
                resolve(value)
            },
            (error: unknown) => {
                cleanup()
                reject(Error.isError(error) ? error : new Error(String(error)))
            },
        )
    })
}
