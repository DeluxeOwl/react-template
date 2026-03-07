import { createTodoApp } from "@react-template/domain/todos/app"
import { TodoRepositoryInMemory } from "@react-template/domain/todos/adapters"

import { TodoHTTP } from "~/todos/adapters"

function main(): void {
    const port = 3041

    const memoryRepo = TodoRepositoryInMemory.create()
    const app = createTodoApp({ todoRepository: memoryRepo })

    const httpAdapter = TodoHTTP.create({
        app: app,
    })
    // eslint-disable-next-line no-restricted-globals -- This is the only instance that's okay.
    Bun.serve({
        fetch: httpAdapter.fetchORPC(),
        port:  port,
    })

    console.info(`Listening on http://localhost:${port}`)
}

main()
