import * as errore from "errore"

import type { Todo } from "./todo"
import type { TransactionError } from "../helpers/repo-helpers"

export class TodoRepositoryError extends Error {}

export class TodoNotFoundError extends errore.createTaggedError({
    extends: TodoRepositoryError,
    message: "todo with id $id not found",
    name:    "TodoNotFoundError",
}) {}

// This can be split into smaller interfaces if needed.
export interface TodoRepository {
    listTodos(): Promise<Todo[]>
    delete(id: string): Promise<void>
    upsert(todo: Todo): Promise<void>
    getByID(id: string): Promise<Todo | TodoNotFoundError>
    // Executes the given function wrapped in a database transaction.
    withinTransaction<T>(
        fn: (repo: TodoRepository) => Promise<T>
    ): Promise<T | TransactionError>
}
