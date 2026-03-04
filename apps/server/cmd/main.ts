import { RPCHandler } from "@orpc/server/fetch"
import { OpenAPIGenerator } from "@orpc/openapi"
import { onError, implement } from "@orpc/server"
import { CORSPlugin } from "@orpc/server/plugins"
import { ZodSmartCoercionPlugin } from "@orpc/zod"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import * as todos from "@react-template/domain/todos"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"

const os = implement(todos.sharedORPC.contract)
const memoryTodos: todos.schemas.TodoOutput[] = [{ done: false, id: crypto.randomUUID(), name: "Do the dishes" }]

const listTodo = os.todos.list.handler(() => {
    return { data: memoryTodos }
})

// TODO [2026-03-06]: create todos domain logic and repos and directories
// Idea: make exports pascal case? Would that be too much?
// like this works: import * as todos from "@react-template/domain/todos"
// import * as todossomething from "@react-template/domain/todos/something"
// could we enforce the import name?
// also, import rules.
const createTodo = os.todos.create.handler(({ input }) => {
    const newTodo: todos.schemas.TodoOutput = {
        done: false,
        id:   crypto.randomUUID(),
        name: input.name,
    }
    memoryTodos.push(newTodo)
    return newTodo
})

const updateTodo = os.todos.update.handler(({ input }) => {
    const todo = memoryTodos.find(({ id }) => id === input.params.id)
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

// eslint-disable-next-line no-restricted-globals -- This is the only instance that's okay.
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
