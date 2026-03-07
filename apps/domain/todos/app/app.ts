
import type { TodoRepository } from "../todo-repository"

import * as cqrs from "../../cqrs"
import { ListTodosHandler } from "./queries/list-todos"
import { CreateTodoHandler } from "./commands/create-todo"
import { ToggleTodoHandler } from "./commands/toggle-todo"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function create(params: {
    todoRepository: TodoRepository
}) {
    return cqrs.createApplication({
        commands: {
            createTodo: CreateTodoHandler.create(params.todoRepository),
            toggleTodo: ToggleTodoHandler.create(params.todoRepository),
        },
        queries: {
            listTodos: ListTodosHandler.create(params.todoRepository),
        },
    })
}

export type TodoApp = ReturnType<typeof create>
