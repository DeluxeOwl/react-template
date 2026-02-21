import { RPCHandler } from "@orpc/server/fetch"
import { OpenAPIGenerator } from "@orpc/openapi"
import { onError, implement } from "@orpc/server"
import { CORSPlugin } from "@orpc/server/plugins"
import { ZodSmartCoercionPlugin } from "@orpc/zod"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"
import { contract, type Planet } from "@react-template/contract"

const os = implement(contract)
const planets: Planet[] = [{ id: crypto.randomUUID(), name: "Earth" }]

const listPlanet = os.planet.list.handler(() => {
    return { data: planets }
})

const createPlanet = os.planet.create.handler(({ input }) => {
    const newPlanet = {
        id:   crypto.randomUUID(),
        name: input.name,
    }
    planets.push(newPlanet)
    return newPlanet
})

const router = os.router({
    planet: {
        create: createPlanet,
        list:   listPlanet,
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
