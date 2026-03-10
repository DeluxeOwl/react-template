/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Result } from "@praha/byethrow"

import { Todo, type TodoDTO } from "./todo"
import { TodoNotFoundError, type TodoRepository } from "./todo-repository"

interface TodoMemoryData {
    id:   string
    name: string
    done: boolean
}

// Repositories have converters, but in this case, they're the same.
function memoryDataFromDTO(dto: TodoDTO): TodoMemoryData {
    return dto
}

function memoryDataToDTO(data: TodoMemoryData): TodoDTO {
    return data
}

// This in memory adapter doesn't depend on web or server, so it's fine for it to live in apps/domain
export class TodoRepositoryInMemory {
    private constructor(private state: {
        isWithinTx: boolean
        store:      Map<string, TodoMemoryData>
    }) {}

    static create(): TodoRepositoryInMemory {
        return new TodoRepositoryInMemory({
            isWithinTx: false,
            store:      new Map<string, TodoMemoryData>(),
        })
    }

    delete(id: string) {
        this.state.store.delete(id)
        return Result.succeed()
    }

    getByID(id: string) {
        return Result.pipe(
            Result.succeed(this.state.store.get(id)),
            Result.andThen((data) => {
                if (!data) {
                    return Result.fail(new TodoNotFoundError({ id: id }))
                }
                return Result.succeed(data)
            }),
            Result.andThen((data) => {
                return Result.succeed(Todo.fromDTO(memoryDataFromDTO(data)))
            }),
        )
    }

    listTodos() {
        return Result.succeed(Array.from(this.state.store.values()).map((t) => Todo.fromDTO(memoryDataToDTO(t))))
    }

    upsert(todo: Todo) {
        const dto = todo.toDTO()
        this.state.store.set(dto.id, memoryDataFromDTO(dto))
        return Result.succeed()
    }

    withinTransaction<T, E>(fn: (repo: TodoRepository) => Result.ResultMaybeAsync<T, E>): Result.ResultMaybeAsync<T, E> {
        if (this.state.isWithinTx) {
            return fn(this)
        }

        const snapshot = new Map<string, TodoMemoryData>()
        for (const [key, value] of this.state.store.entries()) {
            snapshot.set(key, { ...value })
        }

        const txRepo = new TodoRepositoryInMemory({
            isWithinTx: true,
            store:      this.state.store,
        })

        const rollback = (): void => {
            this.state.store.clear()
            for (const [key, value] of snapshot.entries()) {
                this.state.store.set(key, value)
            }
        }

        return Result.pipe(
            fn(txRepo),
            Result.inspectError(() => {
                rollback()
            }),
        )
    }
}
