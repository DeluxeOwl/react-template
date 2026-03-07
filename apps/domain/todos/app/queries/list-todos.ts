import type { TodoRepository } from "../../todo-repository"

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

    async handle(_: ListTodosQuery) {
        const todos = await this.state.repo.listTodos()

        return {
            data: todos.map((t) => t.toDTO()),
        } satisfies ListTodoQueryOutput
    }
}
