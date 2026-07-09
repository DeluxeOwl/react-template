// oxlint-disable typescript/no-explicit-any
import { expect } from "vitest"
import { Result } from "@praha/byethrow"

export function expectResultSuccess<T, E>(
    result: Result.Result<T, E>,
): T {
    expect(() => Result.unwrap(result)).not.toThrow()

    return Result.unwrap(result)
}

export function expectResultFailure<T, E extends Error>(
    result: Result.Result<T, E>,
    errorType: new (...args: any[]) => E,
): void {
    expect(() => Result.unwrap(result)).toThrow(errorType)
}

export function expectResultFailureInstance<T, E extends Error>(
    result: Result.Result<T, E>,
    errorInstance: E,
): void {
    expect(() => Result.unwrap(result)).toThrow(errorInstance)
}

export async function expectResultSuccessAsync<T, E>(
    result: Promise<Result.Result<T, E>>,
): Promise<T> {
    await expect(Result.unwrap(result)).resolves.not.toThrow()

    return Result.unwrap(await result)
}

export async function expectResultFailureAsync<T, E extends Error>(
    result: Result.ResultAsync<T, E>,
    errorType: new (...args: any[]) => E,
): Promise<void> {
    await expect(Result.unwrap(result)).rejects.toThrow(errorType)
}

export async function expectResultFailureMaybeAsync<T, E extends Error>(
    result: Result.ResultAsync<T, E>,
    errorType: new (...args: any[]) => E,
): Promise<void> {
    const resolved = result instanceof Promise ? await result : result
    expectResultFailure(resolved, errorType)
}

export async function expectResultSuccessMaybeAsync<T, E>(
    result: Result.ResultAsync<T, E>,
): Promise<T> {
    const resolved = result instanceof Promise ? await result : result
    return expectResultSuccess(resolved)
}
