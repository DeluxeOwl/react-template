import { H3, serve } from "h3"
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

    // Runtime-agnostic server: `serve` is powered by srvx and adopts the
    // native server of whatever runtime we run on (Bun, Node, Deno, ...).
    // The oRPC adapter does its own internal routing (rpc/api/spec/scalar),
    // so we hand every request to it via a catch-all and pass the untouched
    // web `Request` (`event.req`). Middleware/hooks/routes can be added on the
    // H3 instance later without touching the adapter.
    const fetchORPC = httpAdapter.fetchORPC()
    const httpServer = new H3().all("/**", (event) => fetchORPC(event.req))
    serve(httpServer, { port })

    console.info(`Listening on http://localhost:${port}`)
}

main()
