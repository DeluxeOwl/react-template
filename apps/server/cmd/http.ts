import * as todoAdapters from "~/todos/adapters"

function main(): void {
    const port = 3041

    // eslint-disable-next-line no-restricted-globals -- This is the only instance that's okay.
    Bun.serve({
        fetch: todoAdapters.fetchORPC,
        port:  port,
    })

    console.info(`Listening on http://localhost:${port}`)
}

main()
