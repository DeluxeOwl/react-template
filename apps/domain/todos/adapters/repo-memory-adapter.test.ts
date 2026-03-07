
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/require-await */
import { it, expect, describe } from "vitest"

import { Todo, type TodoDTO } from "../todo"
import { TodoNotFoundError } from "../todo-repository"
import { TransactionError } from "../../helpers/repo-helpers"
import { InMemoryTodoRepository } from "./repo-memory-adapter"

// Helper to create a domain object from a DTO for testing
function createTestTodo(dto: TodoDTO): Todo {
    return Todo.fromDTO(dto)
}

function setupInMemoryRepo(): InMemoryTodoRepository {
    return InMemoryTodoRepository.create()
}

describe("todo repository", () => {
    describe("given a valid todo value", () => {
        describe("when calling upsert for the first time", () => {
            it("then it should insert a new todo into the repository", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto: TodoDTO = { done: false, id: "123", name: "Test Todo" }
                const todo = createTestTodo(dto)

                // WHEN
                await repository.upsert(todo)

                // THEN
                const result = await repository.getByID("123")

                expect(result).toBeInstanceOf(Todo)
                expect((result as Todo).toDTO()).toStrictEqual(dto)
            })
        })
    })

    describe("given an existing todo in the repository", () => {
        describe("when calling upsert with an updated version of that todo", () => {
            it("then it should overwrite the existing record with the new data", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const initialDto: TodoDTO = { done: false, id: "123", name: "Initial Todo" }
                await repository.upsert(createTestTodo(initialDto))

                const updatedDto: TodoDTO = { done: true, id: "123", name: "Updated Todo" }
                const updatedTodo = createTestTodo(updatedDto)

                // WHEN
                await repository.upsert(updatedTodo)

                // THEN
                const result = await repository.getByID("123")

                expect(result).toBeInstanceOf(Todo)
                expect((result as Todo).toDTO()).toStrictEqual({
                    done: true,
                    id:   "123",
                    name: "Updated Todo",
                })
            })
        })
    })
})

describe("getting a todo by id", () => {
    describe("given that the todo exists", () => {
        describe("when calling getByID with a matching ID", () => {
            it("then it should return the expected Todo instance", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto: TodoDTO = { done: false, id: "123", name: "Test Todo" }
                const todo = createTestTodo(dto)
                await repository.upsert(todo)

                // WHEN
                const result = await repository.getByID("123")

                // THEN
                expect(result).toBeInstanceOf(Todo)
                expect((result as Todo).toDTO().name).toBe("Test Todo")
            })
        })
    })

    describe("given that the todo doesn't exist", () => {
        describe("when calling getByID with a nonexistent ID", () => {
            it("then it should return a TodoNotFoundError", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()

                // WHEN
                const result = await repository.getByID("nonexistent")

                // THEN
                expect(result).toBeInstanceOf(TodoNotFoundError)
                expect((result as TodoNotFoundError).id).toBe("nonexistent")
            })
        })
    })
})

describe("listing all todos", () => {
    describe("given that no todos exist in the repository", () => {
        describe("when calling listTodos", () => {
            it("then it should return an empty array", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()

                // WHEN
                const result = await repository.listTodos()

                // THEN
                expect(result).toStrictEqual([])
            })
        })
    })

    describe("given that multiple todos exist", () => {
        describe("when calling listTodos", () => {
            it("then it should return all todos in an array", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto1: TodoDTO = { done: false, id: "1", name: "Todo 1" }
                const dto2: TodoDTO = { done: true, id: "2", name: "Todo 2" }
                await repository.upsert(createTestTodo(dto1))
                await repository.upsert(createTestTodo(dto2))

                // WHEN
                const result = await repository.listTodos()

                // THEN
                expect(result).toHaveLength(2)
                expect(result.map((t) => t.toDTO().name)).toContain("Todo 1")
                expect(result.map((t) => t.toDTO().name)).toContain("Todo 2")
            })
        })
    })
})

describe("deleting a todo", () => {
    describe("given that the todo exists in the repository", () => {
        describe("when calling delete with the matching ID", () => {
            it("then it should remove the todo from the repository", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto: TodoDTO = { done: false, id: "123", name: "Test Todo" }
                await repository.upsert(createTestTodo(dto))

                // WHEN
                await repository.delete("123")

                // THEN
                const result = await repository.getByID("123")

                expect(result).toBeInstanceOf(TodoNotFoundError)
            })
        })
    })

    describe("given that the todo doesn't exist", () => {
        describe("when calling delete with a nonexistent ID", () => {
            it("then it should resolve without throwing an error", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()

                // WHEN
                const deletePromise = repository.delete("nonexistent")

                // THEN
                await expect(deletePromise).resolves.toBeUndefined()
            })
        })
    })
})

describe("running within a transaction", () => {
    describe("given a todo exists in the repository", () => {
        describe("when executing a successful transaction to toggle the todo", () => {
            it("then it should persist the changes and return the toggled todo", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto: TodoDTO = { done: false, id: "123", name: "Test Todo" }
                const todo = createTestTodo(dto)
                await repository.upsert(todo)

                // WHEN
                const result = await repository.withinTransaction(async (repo) => {
                    const retrieved = await repo.getByID("123")
                    if (retrieved instanceof Todo) {
                        retrieved.toggle()
                        await repo.upsert(retrieved)
                    }
                    return retrieved
                })

                // THEN
                expect(result).toBeInstanceOf(Todo)
                expect((result as Todo).toDTO().done).toBe(true)

                const finalTodo = await repository.getByID("123")

                expect((finalTodo as Todo).toDTO().done).toBe(true)
            })
        })

        describe("when a transaction throws (not returns) an error during execution", () => {
            it("then it should return a TransactionError and rollback the changes", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto: TodoDTO = { done: false, id: "123", name: "Test Todo" }
                const todo = createTestTodo(dto)
                await repository.upsert(todo)

                // WHEN
                const result = await repository.withinTransaction(async (repo) => {
                    const retrieved = await repo.getByID("123")
                    if (retrieved instanceof Todo) {
                        retrieved.toggle()
                        await repo.upsert(retrieved)
                    }

                    throw new Error("transaction failed")
                })

                // THEN
                expect(result).toBeInstanceOf(TransactionError)
                expect((result).reason).toBe("transaction failed")

                const finalTodo = await repository.getByID("123")

                expect((finalTodo as Todo).toDTO().done).toBe(false)
            })
        })
    })

    describe("given a valid todo value", () => {
        describe("when a transaction RETURNS (not throws) an error during execution", () => {
            it("then it should return that error and rollback the changes", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto: TodoDTO = { done: false, id: "123", name: "Initial Todo" }
                await repository.upsert(createTestTodo(dto))

                // WHEN
                const result = await repository.withinTransaction(async (repo) => {
                    const retrieved = await repo.getByID("123")
                    if (retrieved instanceof Todo) {
                        retrieved.toggle()
                        await repo.upsert(retrieved)
                    }

                    // Explicitly return a domain error (following 'Never throw' rule)
                    return new TodoNotFoundError({ id: "non-existent-trigger" })
                })

                // THEN
                expect(result).toBeInstanceOf(TodoNotFoundError)

                const finalTodo = await repository.getByID("123")

                // Should NOT have been toggled (rolled back because an error was returned)
                expect((finalTodo as Todo).toDTO().done).toBe(false)
            })
        })
    })

    describe("given an active transaction", () => {
        describe("when the transactional function returns an error", () => {
            it("then the result should be the type of that error", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()

                // WHEN
                const result = await repository.withinTransaction(async (repo) => {
                    return repo.getByID("123")
                })

                // then
                expect(result).toBeInstanceOf(TodoNotFoundError)
            })
        })
    })

    describe("given an active transaction", () => {
        describe("when a nested transaction returns an error", () => {
            it("then the outer transaction should also see the error and rollback", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto: TodoDTO = { done: false, id: "123", name: "Initial Todo" }
                await repository.upsert(createTestTodo(dto))

                // WHEN
                const result = await repository.withinTransaction(async (innerRepo) => {
                    const retrieved = await innerRepo.getByID("123")
                    if (retrieved instanceof Todo) {
                        retrieved.toggle()
                        await innerRepo.upsert(retrieved)
                    }

                    // A nested transaction returns an error
                    const innerResult = await innerRepo.withinTransaction(async () => {
                        return new TodoNotFoundError({ id: "nested-fail" })
                    })

                    // The logic should bubbles up the error to trigger the top-level rollback
                    return innerResult
                })

                // THEN
                expect(result).toBeInstanceOf(TodoNotFoundError)

                const finalTodo = await repository.getByID("123")

                // Should remain false (rolled back the entire sequence)
                expect((finalTodo as Todo).toDTO().done).toBe(false)
            })
        })
    })

    describe("given an active transaction", () => {
        describe("when attempting to start a nested transaction", () => {
            it("then it should not return any errors", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const dto: TodoDTO = { done: false, id: "123", name: "Test Todo" }
                await repository.upsert(createTestTodo(dto))

                // WHEN
                const result = await repository.withinTransaction(async () => {
                    return repository.withinTransaction(async () => {
                        return "nested"
                    })
                })

                // THEN
                expect(result).toBe("nested")
            })
        })
    })
})
