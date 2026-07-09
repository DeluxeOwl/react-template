/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { Client, ResultSet } from "@libsql/client"
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"

import { eq } from "drizzle-orm"
import { Result } from "@praha/byethrow"
import { drizzle } from "drizzle-orm/libsql"
import { Todo } from "@react-template/core/todos/todo"
import {
    type Context, CancelledError, makeCancellable,
} from "@react-template/kernel/ctx"
import {
    InternalDBError, TodoNotFoundError, type TodoRepository,
} from "@react-template/core/todos/todo-repository"

import { todosTable } from "../db/sqlite-schema"

type DrizzleDB = BaseSQLiteDatabase<"async", ResultSet>

function toCancelledOrDBError(error: unknown): CancelledError | InternalDBError {
    if (error instanceof CancelledError) {
        return error
    }
    return new InternalDBError({ cause: error })
}

export class TodoRepositorySqlite implements TodoRepository {
    private constructor(private state: {
        db:         DrizzleDB
        isWithinTx: boolean
    }) {}

    static create(sqliteClient: Client): TodoRepositorySqlite {
        return new TodoRepositorySqlite({
            db:         drizzle(sqliteClient),
            isWithinTx: false,
        })
    }

    delete(ctx: Context, id: string) {
        return Result.pipe(
            Result.try({
                catch: (error) => toCancelledOrDBError(error),
                try:   async () => await makeCancellable(this.state.db.delete(todosTable).where(eq(todosTable.publicId, id)), ctx.signal),
            }),
            Result.andThen((_) => Result.succeed()),
        )
    }

    getByID(ctx: Context, id: string) {
        return Result.pipe(
            Result.try({
                catch: (error) => toCancelledOrDBError(error),
                try:   async () => await makeCancellable(
                    this.state.db.select().from(todosTable)
                        .where(eq(todosTable.publicId, id))
                        .limit(1),
                    ctx.signal,
                ),
            }),
            Result.andThen((res) => {
                if (res.length === 0) {
                    return Result.fail(new TodoNotFoundError({ id }))
                }
                return Result.succeed(Todo.fromDTO({
                    done: res[0].done,
                    id:   res[0].publicId,
                    name: res[0].name,
                }))
            }),
        )
    }

    listTodos(ctx: Context) {
        return Result.pipe(
            Result.try({
                catch: (error) => toCancelledOrDBError(error),
                try:   async () => await makeCancellable(
                    this.state.db.select().from(todosTable),
                    ctx.signal,
                ),
            }),
            Result.map((rows) => rows.map((row) => Todo.fromDTO({
                done: row.done,
                id:   row.publicId,
                name: row.name,
            }))),
        )
    }

    upsert(ctx: Context, todo: Todo) {
        const dto = todo.toDTO()
        return Result.pipe(
            Result.try({
                catch: (error) => toCancelledOrDBError(error),
                try:   async () => await makeCancellable(
                    this.state.db.insert(todosTable).values({
                        done:     dto.done,
                        name:     dto.name,
                        publicId: dto.id,
                    })
                        .onConflictDoUpdate({
                            set:    { done: dto.done, name: dto.name },
                            target: todosTable.publicId,
                        }),
                    ctx.signal,
                ),
            }),
            Result.andThen((_) => Result.succeed()),
        )
    }

    withinTransaction<T, E>(ctx: Context, fn: (ctx: Context, repo: TodoRepository) => Result.ResultAsync<T, E>): Result.ResultAsync<T, E> {
        if (this.state.isWithinTx) {
            return fn(ctx, this)
        }

        return Result.try({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            catch: (error) => error as E,
            try:   () => this.state.db.transaction(async (tx) => {
                const txRepo = new TodoRepositorySqlite({
                    db:         tx,
                    isWithinTx: true,
                })

                const result = await fn(ctx, txRepo)

                return Result.unwrap(result)
            }),
        })
    }
}
