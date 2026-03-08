import type { ContractTypeClient } from "@react-template/domain/todos/adapter-http-routes"

import { RPCLink } from "@orpc/client/fetch"
import { onError, createORPCClient } from "@orpc/client"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"

const link = new RPCLink({
    interceptors: [
        onError((error) => {
            console.error(error)
        }),
    ],
    url: "http://127.0.0.1:3041/rpc",
})

const client: ContractTypeClient = createORPCClient(link)
export const api = createTanstackQueryUtils(client)
