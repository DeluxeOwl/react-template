
import type { ContractTypeClient } from "@react-template/contract"

import { sum } from "@react-template/math"
import { RPCLink } from "@orpc/client/fetch"
import { onError, createORPCClient } from "@orpc/client"
import { QueryClient, useSuspenseQuery, QueryClientProvider } from "@tanstack/react-query"

import { cn } from "~/ui/lib/utils"

const link = new RPCLink({
    interceptors: [
        onError((error) => {
            console.error(error)
        }),
    ],
    url: "http://127.0.0.1:3041/rpc",
})

const client: ContractTypeClient = createORPCClient(link)

function ShowPlanets(): React.ReactNode {
    const planets = useSuspenseQuery({
        queryFn:  client.planet.list,
        queryKey: ["planets"],
    })

    return (
        <ol>
            {planets.data.data.map(({ id, name }) => {
                return <li key={id}>{name}</li>
            })}
        </ol>
    )
}

const queryClient = new QueryClient()

function App(): React.ReactNode {
    const a = 10
    const b = 12

    return (
        <QueryClientProvider client={queryClient}>
            <div className={cn("flex flex-col px-2")}>
                <p>Hello world {sum(a, b)}</p>
                <Suspense fallback={<p>Loading...</p>}>
                    <ShowPlanets />
                </Suspense>
            </div>
        </QueryClientProvider>
    )
}

export default App

