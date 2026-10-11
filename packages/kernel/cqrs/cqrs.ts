import type { Context } from "../ctx"

export interface CommandHandler<C, R = void> {
    handle: (ctx: Context, cmd: C) => R
}

export interface QueryHandler<C, R> {
    handle: (ctx: Context, query: C) => R
}

// `never` input: every handler accepts it, whatever its own command or query type.
export type CommandRecord = Record<string, CommandHandler<never, unknown>>
export type QueryRecord = Record<string, QueryHandler<never, unknown>>

export interface Application<C extends CommandRecord, Q extends QueryRecord> {
    commands: C
    queries:  Q
}

export function createApplication<C extends CommandRecord, Q extends QueryRecord>(
    app: Application<C, Q>,
): Application<C, Q> {
    return app
}
