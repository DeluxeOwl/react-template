
import { Result } from "@praha/byethrow"

import type { Context } from "../ctx"
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

    handle(ctx: Context, cmd: CreateTodoCommand) {
        return Result.pipe(
            Todo.create(cmd.name),
            Result.andThrough((todo) => this.state.repo.upsert(ctx, todo)),
            Result.andThen((todo) => Result.succeed(todo.toDTO())),
        )
    }
}
