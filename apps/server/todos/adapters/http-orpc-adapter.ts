import { RPCHandler } from "@orpc/server/fetch"
import { OpenAPIGenerator } from "@orpc/openapi"
import { onError, implement } from "@orpc/server"
import { CORSPlugin } from "@orpc/server/plugins"
import { ZodSmartCoercionPlugin } from "@orpc/zod"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import * as todos from "@react-template/domain/todos"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"

export interface TodoORPCParams {
    /** @default "/api" */
    apiPath: `/${string}`

    /** @default "/rpc" */
    rpcPath: `/${string}`

    /** @default "/spec.json" */
    specPath: `/${string}`

    /** @default "0.0.1" */
    version: `${number}.${number}.${number}`
}

export const defaultTodoORPCParams: TodoORPCParams = {
    apiPath:  "/api",
    rpcPath:  "/rpc",
    specPath: "/spec.json",
    version:  "0.0.1",
}

export class TodoORPC {
    private constructor(
        private state: TodoORPCParams,
    ) {}

    static create(params: Partial<TodoORPCParams> = {}): TodoORPC {
        return new TodoORPC({
            ...defaultTodoORPCParams,
            ...params,
        })
    }

    fetchORPC() {
        const os = implement(todos.sharedORPC.contract)
        const memoryTodos: todos.schemas.TodoOutputHTTP[] = [{ done: false, id: crypto.randomUUID(), name: "Do the dishes" }]

        const listTodo = os.todos.list.handler(() => {
            return { data: memoryTodos }
        })

        const createTodo = os.todos.create.handler(({ input }) => {
            const newTodo: todos.schemas.TodoOutputHTTP = {
                done: false,
                id:   crypto.randomUUID(),
                name: input.name,
            }
            memoryTodos.push(newTodo)
            return newTodo
        })

        const toggleTodo = os.todos.toggle.handler(({ input }) => {
            const todo = memoryTodos.find(({ id }) => id === input.params.id)
            if (!todo) {
                return
            }

            todo.done = !todo.done
            return todo
        })

        const router = os.router({
            todos: {
                create: createTodo,
                list:   listTodo,
                toggle: toggleTodo,
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

        return async (request: Request): Promise<Response> => {
            const url = new URL(request.url)

            // 1. Route to RPC Handler
            if (url.pathname.startsWith(this.state.rpcPath)) {
                const { matched, response } = await rpcHandler.handle(request, {
                    prefix: this.state.rpcPath,
                })
                if (matched) {
                    return response
                }
            }

            // 2. Route to OpenAPI Spec
            if (url.pathname === this.state.specPath) {
                const spec = await openAPIGenerator.generate(router, {
                    components: {
                        securitySchemes: {
                            bearerAuth: { scheme: "bearer", type: "http" },
                        },
                    },
                    info: {
                        title:   "My Playground",
                        version: this.state.version,
                    },
                    servers: [{ url: this.state.apiPath }],
                })
                return Response.json(spec)
            }

            // 3. Route to OpenAPI Handler
            if (url.pathname.startsWith(this.state.apiPath)) {
                const { matched, response } = await openAPIHandler.handle(request, {
                    prefix: this.state.apiPath,
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
                Scalar.createApiReference('#app', { url: '${this.state.specPath}' })
              </script>
            </body>
          </html>`

            return new Response(html, {
                headers: { "Content-Type": "text/html; charset=utf-8" },
            })
        }
    }
}

