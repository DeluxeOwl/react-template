
import { runRepositoryTests } from "./todo-repository.test"
import { TodoRepositoryInMemory } from "./adapter-repo-memory"

// eslint-disable-next-line vitest/require-hook
runRepositoryTests({
    // oxlint-disable-next-line no-empty-function
    cleanup:             () => {},
    name:                "in memory repo",
    setupTodoRepository: () => TodoRepositoryInMemory.create(),
})
