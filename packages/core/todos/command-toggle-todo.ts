
import type { Context } from "@react-template/kernel/ctx"

import { Result } from "@praha/byethrow"

import type { TodoRepository } from "./todo-repository"

export interface ToggleTodoCommand {
    id: string
}

export class ToggleTodoHandler {
    private constructor(private readonly state: {
        repo: TodoRepository
    }) {}

    static create(repo: TodoRepository): ToggleTodoHandler {
        return new ToggleTodoHandler({ repo })
    }

    async handle(ctx: Context, cmd: ToggleTodoCommand) {
        return this.state.repo.withinTransaction(ctx, async (innerCtx, repo) => {
            return Result.pipe(
                repo.getByID(innerCtx, cmd.id),
                Result.andThen(async (todo) => {
                    todo.toggle()
                    return repo.upsert(innerCtx, todo)
                }),
            )
        })
    }
}
