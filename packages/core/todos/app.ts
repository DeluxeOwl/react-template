
import * as cqrs from "@react-template/kernel/cqrs"

import type { TodoRepository } from "./todo-repository"

import { ListTodosHandler } from "./query-list-todos"
import { CreateTodoHandler } from "./command-create-todo"
import { ToggleTodoHandler } from "./command-toggle-todo"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createTodoApp(params: {
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

export type TodoApp = ReturnType<typeof createTodoApp>
