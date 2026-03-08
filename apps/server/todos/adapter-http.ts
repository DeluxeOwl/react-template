
/* eslint-disable no-restricted-syntax */

import type { TodoApp } from "@react-template/domain/todos/app"

import * as errore from "errore"
import { RPCHandler } from "@orpc/server/fetch"
import { OpenAPIGenerator } from "@orpc/openapi"
import { onError, implement } from "@orpc/server"
import { CORSPlugin } from "@orpc/server/plugins"
import { ZodSmartCoercionPlugin } from "@orpc/zod"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"
import { contract } from "@react-template/domain/todos/adapter-http-routes"

export interface TodoHTTPParams {
    app: TodoApp

    /** @default "/api" */
    apiPath: `/${string}`

    /** @default "/rpc" */
    rpcPath: `/${string}`

    /** @default "/spec.json" */
    specPath: `/${string}`

    /** @default "0.0.1" */
    version: `${number}.${number}.${number}`
}

type RequiredTodoHTTPParams = Pick<TodoHTTPParams, "app">
type OptionalTodoHTTPParams = Omit<TodoHTTPParams, "app">

export const defaultTodoHTTPParams: OptionalTodoHTTPParams = {
    apiPath:  "/api",
    rpcPath:  "/rpc",
    specPath: "/spec.json",
    version:  "0.0.1",
}

export class TodoHTTP {
    private app: TodoApp
    private constructor(
        private state: TodoHTTPParams,
    ) {
        this.app = state.app
    }

    static create(params: Partial<TodoHTTPParams> & RequiredTodoHTTPParams): TodoHTTP {
        return new TodoHTTP({
            ...defaultTodoHTTPParams,
            ...params,
        })
    }

    fetchORPC() {
        const os = implement(contract)

        const listTodo = os.todos.list.handler(async () => {
            const res = await this.app.queries.listTodos.handle(undefined)
            return { data: res.data }
        })

        const createTodo = os.todos.create.handler(async ({ input }) => {
            const res = await this.app.commands.createTodo.handle({ name: input.name })
            // This is handled by validation before, so no special cases here
            if (Error.isError(res)) {
                throw res
            }
            return res
        })

        const toggleTodo = os.todos.toggle.handler(async ({ errors, input }) => {
            const res = await this.app.commands.toggleTodo.handle({ id: input.params.id })
            if (Error.isError(res)) {
                errore.matchErrorPartial(res.cause, {
                    TodoNotFoundError: () => {
                        throw errors.NOT_FOUND({ message: "Todo not found" })
                    },
                }, () => {
                    throw errors.INTERNAL_SERVER_ERROR()
                })
            }
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

