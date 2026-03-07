import type { TodoRepository } from "../../todo-repository"

import { Todo } from "../../todo"
import { CommandError } from "../../../cqrs"

export interface CreateTodoCommand {
    name: string
}

export class CreateTodoHandler {
    private constructor(private state: {
        repo: TodoRepository
    }) {}

    static create(repo: TodoRepository): CreateTodoHandler {
        return new CreateTodoHandler({ repo })
    }

    async handle(cmd: CreateTodoCommand) {
        const todo = Todo.create(cmd.name)

        if (Error.isError(todo)) {
            return CommandError.create({ cause: todo })
        }

        await this.state.repo.upsert(todo)

        return todo.toDTO()
    }
}
