
import { Result } from "@praha/byethrow"

import type { TodoRepository } from "./todo-repository"

import { Todo } from "./todo"

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

    handle(cmd: CreateTodoCommand) {
        return Result.pipe(
            Todo.create(cmd.name),
            Result.andThrough((todo) => this.state.repo.upsert(todo)),
            Result.andThen((todo) => Result.succeed(todo.toDTO())),
        )
    }
}
