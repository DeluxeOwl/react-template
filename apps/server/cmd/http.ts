import { createClient } from "@libsql/client"
import { createTodoApp } from "@react-template/domain/todos/app"

import { TodoHTTP } from "../todos/adapter-http"
import { TodoRepositorySqlite } from "../todos/adapter-repo-sqlite"

function main(): void {
    const port = 3041

    // TODO [2026-06-01] closing clients.
    const client = createClient({ url: "file:file.db" })
    const sqliteRepo = TodoRepositorySqlite.create(client)
    const app = createTodoApp({ todoRepository: sqliteRepo })

    const httpAdapter = TodoHTTP.create({
        app,
    })
    // eslint-disable-next-line no-restricted-globals -- This is the only instance that's okay.
    Bun.serve({
        fetch: httpAdapter.fetchORPC(),
        port,
    })

    console.info(`Listening on http://localhost:${port}`)
}

main()
