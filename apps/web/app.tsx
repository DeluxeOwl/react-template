
import { QueryClient, useSuspenseQuery, QueryClientProvider } from "@tanstack/react-query"

import { api } from "~/api"
import { cn } from "~/ui/lib/utils"

function ShowPlanets(): React.ReactNode {
    const { data:planets } = useSuspenseQuery(api.planet.list.queryOptions())

    return (
        <ol>
            {planets.data.map(({ id, name }) => {
                return <li key={id}>{name}</li>
            })}
        </ol>
    )
}

const queryClient = new QueryClient()

function App(): React.ReactNode {
    return (
        <QueryClientProvider client={queryClient}>
            <div className={cn("flex flex-col px-2")}>
                <p>Hello world</p>
                <Suspense fallback={<p>Loading...</p>}>
                    <ShowPlanets />
                </Suspense>
            </div>
        </QueryClientProvider>
    )
}

export default App

