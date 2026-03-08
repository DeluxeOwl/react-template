import { Todo, type TodoDTO } from "./todo"
import { TodoNotFoundError, type TodoRepository } from "./todo-repository"
import { type TransactionError, executeTransactionFlow } from "../helpers/repo-helpers"

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
export class TodoRepositoryInMemory implements TodoRepository {
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

    // eslint-disable-next-line @typescript-eslint/require-await
    async delete(id: string): Promise<void> {
        this.state.store.delete(id)
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getByID(id: string): Promise<Todo | TodoNotFoundError> {
        const data = this.state.store.get(id)
        if (!data) {
            return new TodoNotFoundError({ id })
        }
        return Todo.fromDTO(memoryDataToDTO(data))
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async listTodos(): Promise<Todo[]> {
        return Array.from(this.state.store.values()).map((t) => Todo.fromDTO(memoryDataToDTO(t)))
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async upsert(todo: Todo): Promise<void> {
        const dto = todo.toDTO()
        this.state.store.set(dto.id, memoryDataFromDTO(dto))
    }

    // oxlint-disable-next-line require-await
    async withinTransaction<T>(fn: (repo: TodoRepository) => Promise<T>): Promise<T | TransactionError> {
        return executeTransactionFlow({
            currentRepo: this,
            fn:          fn,
            isWithinTx:  this.state.isWithinTx,
            setup:       () => {
                // Snapshot
                const snapshot = new Map<string, TodoMemoryData>()
                for (const [key, value] of this.state.store.entries()) {
                    snapshot.set(key, { ...value })
                }

                // Tx Repo
                const txRepo = new TodoRepositoryInMemory({
                    isWithinTx: true,
                    store:      this.state.store,
                })

                // Rollback instructions
                const rollback = (): void => {
                    this.state.store.clear()
                    for (const [key, value] of snapshot.entries()) {
                        this.state.store.set(key, value)
                    }
                }

                return {
                    rollback,
                    txRepo,
                }
            },
        })
    }
}
