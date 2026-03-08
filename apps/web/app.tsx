
import { isDefinedError } from "@orpc/client"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection, useLiveSuspenseQuery } from "@tanstack/react-db"
import { QueryClient, useMutation, QueryClientProvider, type UseMutationOptions } from "@tanstack/react-query"

import { api } from "~/api"
import { cn } from "~/ui/lib/utils"

const queryClient = new QueryClient()

const todoCollection = createCollection(
    queryCollectionOptions({
        getKey:   (item) => item.id,
        onInsert: async ({ transaction }) => {
            const { modified } = transaction.mutations[0]
            await api.todos.create.call({
                name: modified.name,
            })
        },
        onUpdate: async ({ transaction }) => {
            const { modified } = transaction.mutations[0]
            api.todos.toggle.mutationOptions()
            await api.todos.toggle.call({
                params: {
                    id: modified.id,
                },
            })
        },
        queryClient: queryClient,
        queryFn:     async () => {
            const res = await api.todos.list.call()
            return res.data
        },
        queryKey: api.todos.key(),
    }),
)

type MutationParams<T> = T extends UseMutationOptions<infer TData, infer TError, infer TVariables>
    ? { data: TData, error: TError, variables: TVariables }
    : never

// Specifically for your toggle procedure:
type ToggleMutation = MutationParams<ReturnType<typeof api.todos.toggle.mutationOptions>>

function TodoList(): React.ReactNode {
    const { data:todos } = useLiveSuspenseQuery((q) => q.from({ todo: todoCollection }))

    const mutation = useMutation<
        ToggleMutation["data"],
        ToggleMutation["error"],
        string>({
        mutationFn: (id: string) => {
            return todoCollection.update(id, (draft) => {
                draft.done = !draft.done
            }).isPersisted.promise
        },
    })

    return (
        <ol>
            {todos.map((todo) => {
                return (
                    <li
                        key={todo.id}>
                        <button
                            className={cn(todo.done && "line-through")}
                            onClick={() => {
                                mutation.mutate(todo.id)
                            }}
                            type="button">{todo.name} ({todo.id}) {todo.done && "✅"}
                        </button>
                        {mutation.isError && isDefinedError(mutation.error) && <div>{mutation.error.code === "NOT_FOUND"}</div> }
                    </li>
                )
            })}
        </ol>
    )
}

function TodoInput(): React.ReactNode {
    const [text, setText] = useState("")

    return (
        <input
            className="border"
            onChange={(e) => {
                setText(e.currentTarget.value)
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    todoCollection.insert({
                        done: false,
                        id:   "",
                        name: text,
                    })
                    setText("")
                }
            }}
            type="text"
            value={text} />
    )
}

function App(): React.ReactNode {
    return (
        <QueryClientProvider client={queryClient}>
            <div className={cn("flex flex-col px-2")}>
                <h1 className="font-semibold">To do:</h1>
                <Suspense fallback={<p>Loading...</p>}>
                    <TodoList />
                </Suspense>
                <TodoInput />
            </div>
        </QueryClientProvider>
    )
}

export default App

