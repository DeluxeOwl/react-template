import { Result } from "@praha/byethrow"
import {
    it, expect, describe, onTestFinished,
} from "vitest"
import { Context, CancelledError } from "@react-template/kernel/ctx"
import {
    expectResultFailure, expectResultSuccess, expectResultFailureAsync, expectResultFailureMaybeAsync,
} from "@react-template/kernel/test-helpers/result-assertions"

import {
    Todo,
    type TodoDTO, generateTodoPublicId,
} from "./todo"
import { TodoNotFoundError, type TodoRepository } from "./todo-repository"

function createTestTodo(dto: TodoDTO): Todo {
    return Todo.fromDTO(dto)
}

interface RepositoryTestSetup {
    repository: TodoRepository
    cleanup:    () => Promise<void> | void
}

interface SetupRepositoryTests {
    name:                string
    setupTodoRepository: () => Promise<RepositoryTestSetup> | RepositoryTestSetup
}

export function runRepositoryTests(repoTests: SetupRepositoryTests): void {
    describe(repoTests.name, () => {
        describe("todo repository", () => {
            describe("given a valid todo value", () => {
                describe("when calling upsert for the first time", () => {
                    it("then it should insert a new todo into the repository", async () => {
                        expect.hasAssertions()

                        // GIVEN
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const id = generateTodoPublicId()
                        const dto: TodoDTO = {
                            done: false,
                            id,
                            name: "Test Todo",
                        }
                        const todo = createTestTodo(dto)

                        const ctx = Context.create()

                        // WHEN
                        expectResultSuccess(await repository.upsert(ctx, todo))

                        // THEN
                        const result = expectResultSuccess(await repository.getByID(ctx, id))

                        expect(result).toBeInstanceOf(Todo)
                        expect(result.toDTO()).toStrictEqual(dto)
                    })
                })
            })

            describe("given an existing todo in the repository", () => {
                describe("when calling upsert with an updated version of that todo", () => {
                    it("then it should overwrite the existing record with the new data", async () => {
                        expect.hasAssertions()

                        // GIVEN
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const id = generateTodoPublicId()
                        const initialDto: TodoDTO = {
                            done: false,
                            id,
                            name: "Initial Todo",
                        }
                        const ctx = Context.create()
                        expectResultSuccess(await repository.upsert(ctx, createTestTodo(initialDto)))

                        const updatedDto: TodoDTO = {
                            done: true,
                            id,
                            name: "Updated Todo",
                        }
                        const updatedTodo = createTestTodo(updatedDto)

                        // WHEN
                        expectResultSuccess(await repository.upsert(ctx, updatedTodo))

                        // THEN
                        const result = expectResultSuccess(await repository.getByID(ctx, id))

                        expect(result).toBeInstanceOf(Todo)
                        expect(result.toDTO()).toStrictEqual({
                            done: true,
                            id,
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
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const id = generateTodoPublicId()
                        const dto: TodoDTO = {
                            done: false,
                            id,
                            name: "Test Todo",
                        }
                        const todo = createTestTodo(dto)

                        const ctx = Context.create()

                        expectResultSuccess(await repository.upsert(ctx, todo))

                        // WHEN
                        const result = expectResultSuccess(await repository.getByID(ctx, id))

                        // THEN
                        expect(result).toBeInstanceOf(Todo)
                        expect(result.toDTO().name).toBe("Test Todo")
                    })
                })
            })

            describe("given that the todo doesn't exist", () => {
                describe("when calling getByID with a nonexistent ID", () => {
                    it("then it should return a TodoNotFoundError", async () => {
                        expect.hasAssertions()

                        // GIVEN
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })

                        const ctx = Context.create()

                        // WHEN
                        const result = await repository.getByID(ctx, "nonexistent")

                        // THEN
                        expectResultFailure(result, TodoNotFoundError)
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
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })

                        const ctx = Context.create()

                        // WHEN
                        const result = expectResultSuccess(await repository.listTodos(ctx))

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
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const id1 = generateTodoPublicId()
                        const id2 = generateTodoPublicId()
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
                        const ctx = Context.create()

                        expectResultSuccess(await repository.upsert(ctx, createTestTodo(dto1)))
                        expectResultSuccess(await repository.upsert(ctx, createTestTodo(dto2)))

                        // WHEN
                        const result = expectResultSuccess(await repository.listTodos(ctx))

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
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const id = generateTodoPublicId()
                        const dto: TodoDTO = {
                            done: false,
                            id,
                            name: "Test Todo",
                        }
                        const ctx = Context.create()
                        expectResultSuccess(await repository.upsert(ctx, createTestTodo(dto)))

                        // WHEN
                        expectResultSuccess(await repository.delete(ctx, id))

                        // THEN
                        const result = await repository.getByID(ctx, id)

                        expectResultFailure(result, TodoNotFoundError)
                    })
                })
            })

            describe("given that the todo doesn't exist", () => {
                describe("when calling delete with a nonexistent ID", () => {
                    it("then it should resolve without throwing an error", async () => {
                        expect.hasAssertions()

                        // GIVEN
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })

                        const ctx = Context.create()

                        // WHEN
                        const deleteResult = await repository.delete(ctx, "nonexistent")

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
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const id = generateTodoPublicId()
                        const dto: TodoDTO = {
                            done: false,
                            id,
                            name: "Test Todo",
                        }
                        const todo = createTestTodo(dto)

                        const initialCtx = Context.create()

                        expectResultSuccess(await repository.upsert(initialCtx, todo))

                        // WHEN
                        const result = repository.withinTransaction(initialCtx, (ctx, repo) => {
                            return Result.pipe(
                                repo.getByID(ctx, id),
                                Result.andThen(async (t) => {
                                    t.toggle()
                                    await repo.upsert(ctx, t)

                                    return Result.succeed(t)
                                }),
                            )
                        })

                        const t = await Result.unwrap(result)

                        // THEN
                        expect(t).toBeInstanceOf(Todo)
                        expect(t.toDTO().done).toBe(true)

                        const finalTodo = await repository.getByID(initialCtx, id)

                        expect(expectResultSuccess(finalTodo).toDTO().done).toBe(true)
                    })
                })

                describe("when a transaction an error during execution", () => {
                    it("then it should rollback the changes", async () => {
                        expect.hasAssertions()

                        // GIVEN
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const id = generateTodoPublicId()
                        const dto: TodoDTO = {
                            done: false,
                            id,
                            name: "Test Todo",
                        }
                        const todo = createTestTodo(dto)

                        const ctx = Context.create()

                        expectResultSuccess(await repository.upsert(ctx, todo))

                        // WHEN
                        const result = repository.withinTransaction(ctx, (innerCtx, repo) => {
                            return Result.pipe(
                                repo.getByID(innerCtx, id),
                                Result.andThen(async (t) => {
                                    t.toggle()
                                    await repo.upsert(innerCtx, t)

                                    return Result.fail(new Error("failure"))
                                }),
                            )
                        })

                        await expectResultFailureAsync(result, Error)

                        // THEN

                        const finalTodo = expectResultSuccess(await repository.getByID(ctx, id))

                        expect(finalTodo.toDTO().done).toBe(false)
                    })
                })
            })

            describe("given an active transaction", () => {
                describe("when the transactional function returns an error", () => {
                    it("then the result should be the type of that error", async () => {
                        expect.hasAssertions()

                        // GIVEN
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })

                        const ctx = Context.create()

                        // WHEN
                        const result = repository.withinTransaction(ctx, (innerCtx, repo) => {
                            return repo.getByID(innerCtx, "123")
                        })

                        // THEN
                        await expectResultFailureMaybeAsync(result, TodoNotFoundError)
                    })
                })
            })
        })

        describe("given an active transaction", () => {
            describe("when a nested transaction returns an error", () => {
                it("then the outer transaction should also see the error and rollback", async () => {
                    expect.hasAssertions()

                    // GIVEN
                    const { cleanup, repository } = await repoTests.setupTodoRepository()
                    onTestFinished(async () => {
                        await cleanup()
                    })
                    const id = generateTodoPublicId()
                    const dto: TodoDTO = {
                        done: false,
                        id,
                        name: "Initial Todo",
                    }
                    const ctx = Context.create()
                    expectResultSuccess(await repository.upsert(ctx, createTestTodo(dto)))

                    // WHEN
                    const result =  repository.withinTransaction(ctx, async (innerCtx, innerRepo) => {
                        await Result.pipe(
                            innerRepo.getByID(innerCtx, id),
                            Result.andThen(async (t) => {
                                t.toggle()
                                await innerRepo.upsert(innerCtx, t)
                                return Result.succeed()
                            }),
                        )

                        // A nested transaction returns an error
                        // oxlint-disable-next-line require-await
                        // eslint-disable-next-line @typescript-eslint/require-await
                        const innerResult = innerRepo.withinTransaction(ctx, async (_: Context, __: TodoRepository) => {
                            return Result.fail(new TodoNotFoundError({ id: "nested-fail" }))
                        })

                        // The logic should bubbles up the error to trigger the top-level rollback
                        return innerResult
                    })

                    // THEN
                    await expectResultFailureAsync(result, TodoNotFoundError)

                    const finalTodo = await repository.getByID(ctx, id)

                    // Should remain false (rolled back the entire sequence)
                    expect(expectResultSuccess(finalTodo).toDTO().done).toBe(false)
                })
            })
        })

        describe("cancellation via abort signal", () => {
            describe("given a pre-aborted signal", () => {
                describe("when calling listTodos with the cancelled context", () => {
                    it("then it should return a CancelledError", async () => {
                        expect.hasAssertions()

                        // GIVEN
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const controller = new AbortController()
                        controller.abort("cancelled")
                        const ctx = Context.withSignal(controller.signal)

                        // WHEN
                        const result = await repository.listTodos(ctx)

                        // THEN
                        expectResultFailure(result, CancelledError)
                    })
                })
            })

            describe("given a todo exists and a pre-aborted signal", () => {
                describe("when calling upsert with the cancelled context", () => {
                    it("then it should return a CancelledError and not persist the change", async () => {
                        expect.hasAssertions()

                        // GIVEN
                        const { cleanup, repository } = await repoTests.setupTodoRepository()
                        onTestFinished(async () => {
                            await cleanup()
                        })
                        const id = generateTodoPublicId()
                        const dto: TodoDTO = {
                            done: false,
                            id,
                            name: "Original Todo",
                        }
                        const ctx = Context.create()
                        expectResultSuccess(await repository.upsert(ctx, createTestTodo(dto)))

                        const controller = new AbortController()
                        controller.abort("cancelled")
                        const cancelledCtx = Context.withSignal(controller.signal)

                        const updatedTodo = createTestTodo({
                            done: true,
                            id,
                            name: "Updated Todo",
                        })

                        // WHEN
                        const result = await repository.upsert(cancelledCtx, updatedTodo)

                        // THEN
                        expectResultFailure(result, CancelledError)

                        const fetched = expectResultSuccess(await repository.getByID(ctx, id))

                        expect(fetched.toDTO().name).toBe("Original Todo")
                        expect(fetched.toDTO().done).toBe(false)
                    })
                })
            })
        })
    })
}
