// oxlint-disable typescript/no-explicit-any
import { expect } from "vitest"
import { Result } from "@praha/byethrow"

export function expectResultSuccess<T, E>(
    result: Result.Result<T, E>,
): T {
    expect(() => Result.unwrap(result)).not.toThrowError()

    return Result.unwrap(result)
}

export function expectResultFailure<T, E extends Error>(
    result: Result.Result<T, E>,
    errorType: new (...args: any[]) => E,
): void {
    expect(() => Result.unwrap(result)).toThrowError(errorType)
}

export function expectResultFailureInstance<T, E extends Error>(
    result: Result.Result<T, E>,
    errorInstance: E,
): void {
    expect(() => Result.unwrap(result)).toThrowError(errorInstance)
}

export async function expectResultSuccessAsync<T, E>(
    result: Promise<Result.Result<T, E>>,
): Promise<T> {
    await expect(Result.unwrap(result)).resolves.not.toThrowError()

    return Result.unwrap(await result)
}

export async function expectResultFailureAsync<T, E extends Error>(
    result: Result.ResultMaybeAsync<T, E>,
    errorType: new (...args: any[]) => E,
): Promise<void> {
    await expect(Result.unwrap(result)).rejects.toThrowError(errorType)
}
