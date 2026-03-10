
import { Result } from "@praha/byethrow"

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

    handle(cmd: ToggleTodoCommand) {
        return this.state.repo.withinTransaction((repo) => {
            return Result.pipe(
                repo.getByID(cmd.id),
                Result.andThen((todo) => {
                    todo.toggle()
                    return repo.upsert(todo)
                }),
            )
        })
    }
}
