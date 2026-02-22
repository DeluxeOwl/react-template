import { RPCHandler } from "@orpc/server/fetch"
import { OpenAPIGenerator } from "@orpc/openapi"
import * as shared from "@react-template/shared"
import { onError, implement } from "@orpc/server"
import { CORSPlugin } from "@orpc/server/plugins"
import { ZodSmartCoercionPlugin } from "@orpc/zod"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"

const os = implement(shared.contract)
const todos: shared.Todo[] = [{ done: false, id: crypto.randomUUID(), name: "Do the dishes" }]

const listTodo = os.todos.list.handler(() => {
    return { data: todos }
})

const createTodo = os.todos.create.handler(({ input }) => {
    const newTodo: shared.Todo = {
        done: false,
        id:   crypto.randomUUID(),
        name: input.name,
    }
    todos.push(newTodo)
    return newTodo
})

const updateTodo = os.todos.update.handler(({ input }) => {
    const todo = todos.find(({ id }) => id === input.params.id)
    if (!todo) {
        return
    }

    todo.done = input.body.done ?? todo.done
    todo.name = input.body.name ?? todo.name
    return todo
})

const router = os.router({
    todos: {
        create: createTodo,
        list:   listTodo,
        update: updateTodo,
    },
})

const rpcHandler = new RPCHandler(router, {
    interceptors: [
        onError((error) => {
            console.error(error)
        }),
    ],
    plugins: [new CORSPlugin()],
})

const openAPIHandler = new OpenAPIHandler(router, {
    plugins: [
        new CORSPlugin(),
        new ZodSmartCoercionPlugin(),
    ],
})

const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
})

const port = 3041

Bun.serve({
    async fetch(request: Request) {
        const url = new URL(request.url)

        // 1. Route to RPC Handler
        if (url.pathname.startsWith("/rpc")) {
            const { matched, response } = await rpcHandler.handle(request, {
                prefix: "/rpc",
            })
            if (matched) {
                return response
            }
        }

        // 2. Route to OpenAPI Spec
        if (url.pathname === "/spec.json") {
            const spec = await openAPIGenerator.generate(router, {
                components: {
                    securitySchemes: {
                        bearerAuth: { scheme: "bearer", type: "http" },
                    },
                },
                info: {
                    title:   "My Playground",
                    version: "1.0.0",
                },
                servers: [{ url: "/api" }],
            })
            return Response.json(spec)
        }

        // 3. Route to OpenAPI Handler
        if (url.pathname.startsWith("/api")) {
            const { matched, response } = await openAPIHandler.handle(request, {
                prefix: "/api",
            })
            if (matched) {
                return response
            }
        }

        // 4. Default: Scalar HTML Reference
        const html = `
          <!doctype html>
          <html>
            <head>
              <title>My Client</title>
              <meta charset="utf-8" />
              <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
            </head>
            <body>
              <div id="app"></div>
              <script>
                Scalar.createApiReference('#app', { url: '/spec.json' })
              </script>
            </body>
          </html>`

        return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        })
    },
    port: port,
})

console.info(`Listening on http://localhost:${port}`)
