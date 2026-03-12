/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { Client, ResultSet } from "@libsql/client"
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"

import { eq } from "drizzle-orm"
import { Result } from "@praha/byethrow"
import { drizzle } from "drizzle-orm/libsql"
import { Todo } from "@react-template/domain/todos/todo"
import {
    InternalDBError, TodoNotFoundError, type TodoRepository,
} from "@react-template/domain/todos/todo-repository"

import { todosTable } from "../db/sqlite-schema"

type DrizzleDB = BaseSQLiteDatabase<"async", ResultSet>

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

    delete(id: string) {
        return Result.pipe(
            Result.try({
                catch: (error) => new InternalDBError({ cause: error }),
                try:   async () => await this.state.db.delete(todosTable).where(eq(todosTable.id, id)),
            }),
            Result.andThen((_) => Result.succeed()),
        )
    }

    getByID(id: string) {
        return Result.pipe(
            Result.try({
                catch: (error) => new InternalDBError({ cause: error }),
                try:   async () => await this.state.db.select().from(todosTable)
                    .where(eq(todosTable.id, id))
                    .limit(1),
            }),
            Result.andThen((res) => {
                if (res.length === 0) {
                    return Result.fail(new TodoNotFoundError({ id: id }))
                }
                return Result.succeed(Todo.fromDTO(res[0]))
            }),
        )
    }

    listTodos() {
        return Result.pipe(
            Result.try({
                catch: (error) => new InternalDBError({ cause: error }),
                try:   async () => await this.state.db.select().from(todosTable),
            }),
            Result.map((todos) => todos.map((todo) => Todo.fromDTO(todo))),
        )
    }

    upsert(todo: Todo) {
        const dto = todo.toDTO()
        return Result.pipe(
            Result.try({
                catch: (error) => new InternalDBError({ cause: error }),
                try:   async () => await this.state.db.insert(todosTable).values({
                    done: dto.done,
                    id:   dto.id,
                    name: dto.name,
                })
                    .onConflictDoUpdate({
                        set:    { done: dto.done, name: dto.name },
                        target: todosTable.id,
                    }),
            }),
            Result.andThen((_) => Result.succeed()),
        )
    }

    withinTransaction<T, E>(fn: (repo: TodoRepository) => Result.ResultMaybeAsync<T, E>): Result.ResultMaybeAsync<T, E> {
        if (this.state.isWithinTx) {
            return fn(this)
        }

        return Result.try({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            catch: (error) => error as E,
            try:   () => this.state.db.transaction(async (tx) => {
                const txRepo = new TodoRepositorySqlite({
                    db:         tx,
                    isWithinTx: true,
                })

                const result = await fn(txRepo)

                return Result.unwrap(result)
            }),
        })
    }
}

