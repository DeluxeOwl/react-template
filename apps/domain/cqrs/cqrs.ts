import * as errore from "errore"

export interface CommandHandler<C, R = void> {
    handle(cmd: C): R
}

export interface QueryHandler<C, R> {
    handle(query: C): R
}

export type CommandRecord = Record<string, CommandHandler<unknown, unknown>>
export type QueryRecord = Record<string, QueryHandler<unknown, unknown>>

export interface Application<C extends CommandRecord, Q extends QueryRecord> {
    commands: C
    queries:  Q
}

export function createApplication<C extends CommandRecord, Q extends QueryRecord>(
    app: Application<C, Q>,
): Application<C, Q> {
    return app
}

// Added type safe `cause` for the CQRS errors.
// On command and query handlers we don't specify the return type in order to get better type safety for the errors.

function isErrorWithCause(error: unknown): error is Error & { cause?: unknown } {
    return Error.isError(error)
}

function getFullErrorMessage(error: unknown): string {
    // If it's not an Error object, convert it to a string and return
    if (!isErrorWithCause(error)) {
        return String(error)
    }

    // Base case: No cause exists
    if (error.cause === undefined || error.cause === null) {
        return error.message
    }

    // Recursive step: Append the current message to the result of the cause
    return `${error.message}: ${getFullErrorMessage(error.cause)}`
}

export class CQRSError extends Error {}

// TODO [2026-03-30] I'm not even sure if it's worth the effort to make the cause
// typesafe, like isn't that a CQRS layer 'leak'? Why would the adapters even need type safe access to underlying error?
// Wouldn't it be better to pass some error codes around?
// Or make these error have a certain format: code, message etc.
export class CommandError<E extends Error = Error> extends errore.createTaggedError({
    extends: CQRSError,
    message: "command error",
    name:    "CommandError",
}) {
    declare cause: E

    static create<E extends Error>(props: {
        cause: E
    }): CommandError<E> {
        return new CommandError(props)
    }

    fullMessage(): string {
        return getFullErrorMessage(this)
    }
}

export class QueryError<E extends Error = Error> extends errore.createTaggedError({
    extends: CQRSError,
    message: "query error",
    name:    "QueryError",
}) {
    declare cause: E

    static create<E extends Error>(props: {
        cause: E
    }): QueryError<E> {
        return new QueryError(props)
    }

    fullMessage(): string {
        return getFullErrorMessage(this)
    }
}

/**
 * Utility type for Command return values.
 */
export type CommandOutcome<R, E extends Error = Error> = Promise<CommandError<E> | R>

/**
 * Utility type for Query return values.
 */
export type QueryOutcome<R, E extends Error = Error> = Promise<QueryError<E> | R>

