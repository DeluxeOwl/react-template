import { Result } from "@praha/byethrow"
import {
    it, expect, describe,
} from "vitest"

import { TodoNotFoundError } from "./todo-repository"
import { TodoRepositoryInMemory } from "./adapter-repo-memory"
import {
    Todo, type TodoDTO,
    generateTodoIDString,
} from "./todo"
import {
    expectResultFailure, expectResultSuccess, expectResultFailureAsync,
} from "../test-helpers/result"

// Helper to create a domain object from a DTO for testing
function createTestTodo(dto: TodoDTO): Todo {
    return Todo.fromDTO(dto)
}

function setupInMemoryRepo(): TodoRepositoryInMemory {
    return TodoRepositoryInMemory.create()
}

describe("todo repository", () => {
    describe("given a valid todo value", () => {
        describe("when calling upsert for the first time", () => {
            it("then it should insert a new todo into the repository", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const id = generateTodoIDString()
                const dto: TodoDTO = {
                    done: false,
                    id:   id,
                    name: "Test Todo",
                }
                const todo = createTestTodo(dto)

                // WHEN
                expectResultSuccess(repository.upsert(todo))

                // THEN
                const result = expectResultSuccess(repository.getByID(id))

                expect(result).toBeInstanceOf(Todo)
                expect(result.toDTO()).toStrictEqual(dto)
            })
        })
    })

    describe("given an existing todo in the repository", () => {
        describe("when calling upsert with an updated version of that todo", () => {
            it("then it should overwrite the existing record with the new data", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const id = generateTodoIDString()
                const initialDto: TodoDTO = {
                    done: false,
                    id:   id,
                    name: "Initial Todo",
                }
                expectResultSuccess(repository.upsert(createTestTodo(initialDto)))

                const updatedDto: TodoDTO = {
                    done: true,
                    id:   id,
                    name: "Updated Todo",
                }
                const updatedTodo = createTestTodo(updatedDto)

                // WHEN
                expectResultSuccess(repository.upsert(updatedTodo))

                // THEN
                const result = expectResultSuccess(repository.getByID(id))

                expect(result).toBeInstanceOf(Todo)
                expect(result.toDTO()).toStrictEqual({
                    done: true,
                    id:   id,
                    name: "Updated Todo",
                })
            })
        })
    })
})

describe("getting a todo by id", () => {
    describe("given that the todo exists", () => {
        describe("when calling getByID with a matching ID", () => {
            it("then it should return the expected Todo instance", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const id = generateTodoIDString()
                const dto: TodoDTO = {
                    done: false,
                    id:   id,
                    name: "Test Todo",
                }
                const todo = createTestTodo(dto)

                expectResultSuccess(repository.upsert(todo))

                // WHEN
                const result = expectResultSuccess(repository.getByID(id))

                // THEN
                expect(result).toBeInstanceOf(Todo)
                expect(result.toDTO().name).toBe("Test Todo")
            })
        })
    })

    describe("given that the todo doesn't exist", () => {
        describe("when calling getByID with a nonexistent ID", () => {
            it("then it should return a TodoNotFoundError", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()

                // WHEN
                const result = repository.getByID("nonexistent")

                // THEN
                expectResultFailure(result, TodoNotFoundError)
            })
        })
    })
})

describe("listing all todos", () => {
    describe("given that no todos exist in the repository", () => {
        describe("when calling listTodos", () => {
            it("then it should return an empty array", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()

                // WHEN
                const result = expectResultSuccess(repository.listTodos())

                // THEN
                expect(result).toStrictEqual([])
            })
        })
    })

    describe("given that multiple todos exist", () => {
        describe("when calling listTodos", () => {
            it("then it should return all todos in an array", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const id1 = generateTodoIDString()
                const id2 = generateTodoIDString()
                const dto1: TodoDTO = {
                    done: false,
                    id:   id1,
                    name: "Todo 1",
                }
                const dto2: TodoDTO = {
                    done: true,
                    id:   id2,
                    name: "Todo 2",
                }
                expectResultSuccess(repository.upsert(createTestTodo(dto1)))
                expectResultSuccess(repository.upsert(createTestTodo(dto2)))

                // WHEN
                const result = expectResultSuccess(repository.listTodos())

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
            it("then it should remove the todo from the repository", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const id = generateTodoIDString()
                const dto: TodoDTO = {
                    done: false,
                    id:   id,
                    name: "Test Todo",
                }
                expectResultSuccess(repository.upsert(createTestTodo(dto)))

                // WHEN
                expectResultSuccess(repository.delete(id))

                // THEN
                const result = repository.getByID(id)

                expectResultFailure(result, TodoNotFoundError)
            })
        })
    })

    describe("given that the todo doesn't exist", () => {
        describe("when calling delete with a nonexistent ID", () => {
            it("then it should resolve without throwing an error", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()

                // WHEN
                const deleteResult = repository.delete("nonexistent")

                // THEN
                expectResultSuccess(deleteResult)
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
                const id = generateTodoIDString()
                const dto: TodoDTO = {
                    done: false,
                    id:   id,
                    name: "Test Todo",
                }
                const todo = createTestTodo(dto)

                expectResultSuccess(repository.upsert(todo))

                // WHEN
                const result = repository.withinTransaction((repo) => {
                    return Result.pipe(
                        repo.getByID(id),
                        Result.andThen(async (t) => {
                            t.toggle()
                            await repo.upsert(t)

                            return Result.succeed(t)
                        }),
                    )
                })

                const t = await Result.unwrap(result)

                // THEN
                expect(t).toBeInstanceOf(Todo)
                expect(t.toDTO().done).toBe(true)

                const finalTodo = repository.getByID(id)

                expect(expectResultSuccess(finalTodo).toDTO().done).toBe(true)
            })
        })

        describe("when a transaction an error during execution", () => {
            it("then it should rollback the changes", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const id = generateTodoIDString()
                const dto: TodoDTO = {
                    done: false,
                    id:   id,
                    name: "Test Todo",
                }
                const todo = createTestTodo(dto)

                expectResultSuccess(repository.upsert(todo))

                // WHEN
                const result = repository.withinTransaction((repo) => {
                    return Result.pipe(
                        repo.getByID(id),
                        Result.andThen(async (t) => {
                            t.toggle()
                            await repo.upsert(t)

                            return Result.fail(new Error("failure"))
                        }),
                    )
                })

                await expectResultFailureAsync(result, Error)

                // THEN

                const finalTodo = expectResultSuccess(repository.getByID(id))

                expect(finalTodo.toDTO().done).toBe(false)
            })
        })
    })

    describe("given an active transaction", () => {
        describe("when the transactional function returns an error", () => {
            it("then the result should be the type of that error", () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()

                // WHEN
                const result = repository.withinTransaction((repo) => {
                    return repo.getByID("123")
                })

                // then
                expectResultFailure(result, TodoNotFoundError)
            })
        })
    })

    describe("given an active transaction", () => {
        describe("when a nested transaction returns an error", () => {
            it("then the outer transaction should also see the error and rollback", async () => {
                expect.hasAssertions()

                // GIVEN
                const repository = setupInMemoryRepo()
                const id = generateTodoIDString()
                const dto: TodoDTO = {
                    done: false,
                    id:   id,
                    name: "Initial Todo",
                }
                expectResultSuccess(repository.upsert(createTestTodo(dto)))

                // WHEN
                const result =  repository.withinTransaction(async (innerRepo) => {
                    await Result.pipe(
                        innerRepo.getByID(id),
                        Result.andThen(async (t) => {
                            t.toggle()
                            await innerRepo.upsert(t)
                            return Result.succeed()
                        }),
                    )

                    // A nested transaction returns an error
                    const innerResult = innerRepo.withinTransaction(() => {
                        return Result.fail(new TodoNotFoundError({ id: "nested-fail" }))
                    })

                    // The logic should bubbles up the error to trigger the top-level rollback
                    return innerResult
                })

                // THEN
                await expectResultFailureAsync(result, TodoNotFoundError)

                const finalTodo = repository.getByID(id)

                // Should remain false (rolled back the entire sequence)
                expect(expectResultSuccess(finalTodo).toDTO().done).toBe(false)
            })
        })
    })
})
