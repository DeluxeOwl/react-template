
import { P, match } from "ts-pattern"

import { CommandError } from "../cqrs"
import { TodoNotFoundError, type TodoRepository } from "./todo-repository"

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

    async handle(cmd: ToggleTodoCommand) {
        const res = await this.state.repo.withinTransaction(async (repo) => {
            const todo = await repo.getByID(cmd.id)
            if (Error.isError(todo)) {
                return todo
            }

            todo.toggle()

            await repo.upsert(todo)
        })

        if (Error.isError(res)) {
            return match(res).with(P.instanceOf(TodoNotFoundError), (e) => CommandError.create({ cause: e }))
                .otherwise((e) => CommandError.create({ cause: e }))
        }
    }
}
