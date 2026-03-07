import * as todoAdapters from "~/todos/adapters"

function main(): void {
    const port = 3041

    const httpAdapter = todoAdapters.TodoORPC.create()

    // eslint-disable-next-line no-restricted-globals -- This is the only instance that's okay.
    Bun.serve({
        fetch: httpAdapter.fetchORPC(),
        port:  port,
    })

    console.info(`Listening on http://localhost:${port}`)
}

main()
