
import { Result } from "@praha/byethrow"

import type { Context } from "../ctx"
import type { TodoRepository } from "./todo-repository"

export interface ToggleTodoCommand {
    id: string
}

export class ToggleTodoHandler {
    private constructor(private state: {
        repo: TodoRepository
    }) {}

    static create(repo: TodoRepository): ToggleTodoHandler {
        return new ToggleTodoHandler({ repo })
    }

    handle(ctx: Context, cmd: ToggleTodoCommand) {
        return this.state.repo.withinTransaction(ctx, (innerCtx, repo) => {
            return Result.pipe(
                repo.getByID(innerCtx, cmd.id),
                Result.andThen((todo) => {
                    todo.toggle()
                    return repo.upsert(innerCtx, todo)
                }),
            )
        })
    }
}
