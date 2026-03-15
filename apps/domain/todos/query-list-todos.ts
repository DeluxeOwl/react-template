import { Result } from "@praha/byethrow"

import type { Context } from "../ctx"
import type { TodoRepository } from "./todo-repository"

export type ListTodosQuery = undefined

export interface ListTodoQueryOutput {
    data: {
        done: boolean
        id:   string
        name: string
    }[]
}

export class ListTodosHandler {
    private constructor(private state: {
        repo: TodoRepository
    }) {}

    static create(repo: TodoRepository): ListTodosHandler {
        return new ListTodosHandler({ repo })
    }

    handle(ctx: Context, _: ListTodosQuery) {
        return Result.pipe(
            this.state.repo.listTodos(ctx),
            Result.andThen((todos) => Result.succeed({
                data: todos.map((t) => t.toDTO()),
            } satisfies ListTodoQueryOutput)),
        )
    }
}
