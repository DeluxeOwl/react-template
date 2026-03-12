
import type { Result } from "@praha/byethrow"

import { ErrorFactory } from "@praha/error-factory"

import type { Todo } from "./todo"

export class TodoNotFoundError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ id: string }>(),
    message: "Todo not found",
    name:    "TodoNotFoundError",
}) {}

export class InternalDBError extends ErrorFactory({
    message: `internal db error`,
    name:    "InternalDBError",
}) {}

// This can be split into smaller interfaces if needed.
// Repositories use Result.ResultMaybeAsync, because some of the repos (in memory)
// are not async.
export interface TodoRepository {
    listTodos(): Result.ResultMaybeAsync<Todo[], InternalDBError>
    delete(id: string): Result.ResultMaybeAsync<void, InternalDBError>
    upsert(todo: Todo):  Result.ResultMaybeAsync<void, InternalDBError>
    getByID(id: string): Result.ResultMaybeAsync<Todo, InternalDBError | TodoNotFoundError>

    // Executes the given function wrapped in a database transaction.
    withinTransaction<T, E>(
        fn: (repo: TodoRepository) => Result.ResultMaybeAsync<T, E>
    ): Result.ResultMaybeAsync<T, E>
}
