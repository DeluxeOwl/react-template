import { serve } from "srvx"
import { createClient } from "@libsql/client"
import { createTodoApp } from "@react-template/core/todos/app"

import { TodoHTTP } from "../todos/adapter-http"
import { TodoRepositorySqlite } from "../todos/adapter-repo-sqlite"

function main(): void {
    const port = 3041

    // TODO [2026-12-01] closing clients.
    const client = createClient({ url: "file:file.db" })
    const sqliteRepo = TodoRepositorySqlite.create(client)
    const app = createTodoApp({ todoRepository: sqliteRepo })

    const httpAdapter = TodoHTTP.create({
        app,
    })

    // Runtime-agnostic server: `serve` from srvx adopts the native server of
    // whatever runtime we run on (Bun, Node, Deno, ...). The oRPC adapter does
    // its own internal routing (rpc/api/spec/scalar), so we hand every request
    // to it directly via the `fetch` handler with the untouched web `Request`.
    const fetchORPC = httpAdapter.fetchORPC()
    serve({ fetch: (request) => fetchORPC(request), port })

    console.info(`Listening on http://localhost:${port}`)
}

main()
