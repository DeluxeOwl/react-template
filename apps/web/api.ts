import type { ContractTypeClient } from "@react-template/domain/todos/adapter-http-routes"

import { RPCLink } from "@orpc/client/fetch"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import {
    onError, ORPCError, createORPCClient, type InferClientErrorUnion,
} from "@orpc/client"

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

type AllORPCErrors = InferClientErrorUnion<typeof client>
type OnlyKnownORPCErrors = Exclude<AllORPCErrors, Error & { code?: never }>

// The normal isDefinedError only works for client methods.
// This is for usage in ErrorBoundaries.
export function isKnownORPCError(error: unknown): error is OnlyKnownORPCErrors {
    return error instanceof ORPCError
}
