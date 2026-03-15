/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { Client, ResultSet } from "@libsql/client"
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"

import { eq } from "drizzle-orm"
import { Result } from "@praha/byethrow"
import { drizzle } from "drizzle-orm/libsql"
import { Todo } from "@react-template/domain/todos/todo"
import {
    type Context, CancelledError, makeCancellable,
} from "@react-template/domain/ctx/index"
import {
    InternalDBError, TodoNotFoundError, type TodoRepository,
} from "@react-template/domain/todos/todo-repository"

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
                try:   async () => await makeCancellable(this.state.db.delete(todosTable).where(eq(todosTable.id, id)), ctx.signal),
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
                        .where(eq(todosTable.id, id))
                        .limit(1),
                    ctx.signal,
                ),
            }),
            Result.andThen((res) => {
                if (res.length === 0) {
                    return Result.fail(new TodoNotFoundError({ id: id }))
                }
                return Result.succeed(Todo.fromDTO(res[0]))
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
            Result.map((todos) => todos.map((todo) => Todo.fromDTO(todo))),
        )
    }

    upsert(ctx: Context, todo: Todo) {
        const dto = todo.toDTO()
        return Result.pipe(
            Result.try({
                catch: (error) => toCancelledOrDBError(error),
                try:   async () => await makeCancellable(
                    this.state.db.insert(todosTable).values({
                        done: dto.done,
                        id:   dto.id,
                        name: dto.name,
                    })
                        .onConflictDoUpdate({
                            set:    { done: dto.done, name: dto.name },
                            target: todosTable.id,
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

