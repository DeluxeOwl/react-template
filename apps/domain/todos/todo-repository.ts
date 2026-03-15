
import type { Result } from "@praha/byethrow"

import { ErrorFactory } from "@praha/error-factory"

import type { Todo } from "./todo"
import type { Context, CancelledError  } from "../ctx"

export class TodoNotFoundError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ id: string }>(),
    message: "Todo not found",
    name:    "TodoNotFoundError",
}) {}

export class InternalDBError extends ErrorFactory({
    message: `internal db error`,
    name:    "InternalDBError",
}) {}

export interface TodoRepository {
    listTodos(Context: Context): Result.ResultAsync<Todo[], CancelledError | InternalDBError>
    delete(Context: Context, id: string): Result.ResultAsync<void, CancelledError | InternalDBError>
    upsert(Context: Context, todo: Todo):  Result.ResultAsync<void, CancelledError | InternalDBError>
    getByID(Context: Context, id: string): Result.ResultAsync<Todo, CancelledError | InternalDBError | TodoNotFoundError>

    // Executes the given function wrapped in a database transaction.
    withinTransaction<T, E>(
        Context: Context,
        fn: (Context: Context, repo: TodoRepository) => Result.ResultAsync<T, E>
    ): Result.ResultAsync<T, E>
}
