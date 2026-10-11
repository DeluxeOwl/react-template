
import type { Context } from "@react-template/kernel/ctx"

import { Result } from "@praha/byethrow"

import type { TodoRepository } from "./todo-repository"

import { Todo } from "./todo"

export interface CreateTodoCommand {
    name:      string
    publicId?: string
}

export class CreateTodoHandler {
    private constructor(private readonly state: {
        repo: TodoRepository
    }) {}

    static create(repo: TodoRepository): CreateTodoHandler {
        return new CreateTodoHandler({ repo })
    }

    async handle(ctx: Context, cmd: CreateTodoCommand) {
        return Result.pipe(
            Todo.create(cmd.name, cmd.publicId),
            Result.andThrough(async (todo) => this.state.repo.upsert(ctx, todo)),
            Result.andThen((todo) => Result.succeed(todo.toDTO())),
        )
    }
}
