
/* eslint-disable no-restricted-syntax */

import type { TodoApp } from "@react-template/core/todos/app"

import * as z from "zod"
import { match } from "ts-pattern"
import { Result } from "@praha/byethrow"
import { RPCHandler } from "@orpc/server/fetch"
import { OpenAPIGenerator } from "@orpc/openapi"
import { CORSPlugin } from "@orpc/server/plugins"
import { ZodSmartCoercionPlugin } from "@orpc/zod"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { Context } from "@react-template/kernel/ctx"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"
import { contract } from "@react-template/core/todos/adapter-http-routes"
import {
    onError, implement, ORPCError, ValidationError,
} from "@orpc/server"
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

        const listTodo = os.todos.list.handler(async ({ signal }) => {
            const res = await Result.unwrap(this.app.queries.listTodos.handle(Context.withSignal(signal), undefined))
            return { data: res.data }
        })

        const createTodo = os.todos.create.handler(async ({ input, signal }) => {
            const res = await this.app.commands.createTodo.handle(Context.withSignal(signal), { name: input.name, publicId: input.id })

            // This is handled by validation before, so no special cases here
            if (Result.isFailure(res)) {
                throw res.error
            }

            return res.value
        })

        const toggleTodo = os.todos.toggle.handler(async ({
            errors, input, signal,
        }) => {
            const res = await this.app.commands.toggleTodo.handle(Context.withSignal(signal), { id: input.params.id })
            if (Result.isFailure(res)) {
                match(res.error.name)
                    .with("TodoNotFoundError", () => {
                        throw errors.NOT_FOUND({ message: "Todo not found" })
                    })
                    .with("CancelledError", () => {
                        throw errors.INTERNAL_SERVER_ERROR({ message: "Request cancelled" })
                    })
                    .with("InternalDBError", () => {
                        throw errors.INTERNAL_SERVER_ERROR({ message: "Database error" })
                    })
                    .exhaustive()
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
            clientInterceptors: [
                onError((error) => {
                    console.error(error)
                    if (
                        error instanceof ORPCError
                        && error.code === "BAD_REQUEST"
                        && error.cause instanceof ValidationError
                    ) {
                        // If you only use Zod you can safely cast to ZodIssue[]
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                        const zodError = new z.ZodError(error.cause.issues as z.core.$ZodIssue[])

                        throw new ORPCError("INPUT_VALIDATION_FAILED", {
                            cause:   error.cause,
                            data:    z.flattenError(zodError),
                            message: z.prettifyError(zodError),
                            status:  422,
                        })
                    }

                    if (
                        error instanceof ORPCError
                        && error.code === "INTERNAL_SERVER_ERROR"
                        && error.cause instanceof ValidationError
                    ) {
                        throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
                            cause: error.cause,
                        })
                    }
                }),
            ],
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
                            bearerAuth: {
                                scheme: "bearer",
                                type:   "http",
                            },
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

