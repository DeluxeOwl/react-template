
import { isDefinedError } from "@orpc/client"
import { generateTodoID } from "@react-template/domain/todos/todo"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection, useLiveSuspenseQuery } from "@tanstack/react-db"
import { TodoOutputHTTPSchema } from "@react-template/domain/todos/adapter-http-schemas"
import { QueryClient, useMutation, QueryClientProvider, type UseMutationOptions } from "@tanstack/react-query"

import { api } from "~/api"
import { cn } from "~/ui/lib/utils"

const queryClient = new QueryClient()

const todoCollection = createCollection(
    queryCollectionOptions({
        getKey:   (item) => item.id,
        onInsert: async ({ transaction }) => {
            const { modified } = transaction.mutations[0]
            const serverResponse = await api.todos.create.call({
                name: modified.name,
            })

            // This writes the "real" result directly after creating, telling tanstack to not refetch.
            todoCollection.utils.writeInsert(serverResponse)
            return { refetch: false }
        },
        onUpdate: async ({ transaction }) => {
            const { modified } = transaction.mutations[0]

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

function TodoList(): React.ReactNode {
    const { data:todos } = useLiveSuspenseQuery((q) => q.from({ todo: todoCollection }))

    return (
        <ol>
            {todos.map((todo) => {
                return (
                    <li
                        key={todo.id}>
                        <button
                            className={cn(todo.done && "line-through")}
                            onClick={() => {
                                todoCollection.update(todo.id, (draft) => {
                                    draft.done = !draft.done
                                })
                            }}
                            type="button">{todo.name} ({todo.id}) {todo.done && "✅"}
                        </button>
                    </li>
                )
            })}
        </ol>
    )
}

type CreateMutation = MutationParams<ReturnType<typeof api.todos.create.mutationOptions>>
function TodoInput(): React.ReactNode {
    const [text, setText] = useState("")

    const mutation = useMutation<CreateMutation["data"], CreateMutation["error"], string>({
        mutationFn: async (name: string) => {
            const tx = todoCollection.insert({
                done: false,
                id:   generateTodoID().toString(),
                name,
            })

            // If you want the 'real' object here, your onInsert
            // needs a way to pass it back. Currently, the easiest way
            // is to just get it from the collection after persistence:
            await tx.isPersisted.promise

            // At this point, onInsert has finished and updated the collection
            // oxlint-disable-next-line typescript/no-non-null-assertion -- We know for sure it's the real object.
            return todoCollection.get(TodoOutputHTTPSchema.parse(tx.mutations[0].modified).id)!
        },
    })

    console.info(isDefinedError(mutation.error))

    return (
        <div className="flex flex-col gap-2">
            <input
                className="border"
                onChange={(e) => {
                    setText(e.currentTarget.value)
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        mutation.mutate(text)
                        setText("")
                    }
                }}
                type="text"
                value={text} />
            <div>{isDefinedError(mutation.error) && mutation.error.message}</div>
        </div>
    )
}

function App(): React.ReactNode {
    return (
        <QueryClientProvider client={queryClient}>
            <div className={cn("flex flex-col px-2")}>
                <h1 className="font-semibold">To do:</h1>
                <TodoInput />
                <Suspense fallback={<p>Loading...</p>}>
                    <TodoList />
                </Suspense>
            </div>
        </QueryClientProvider>
    )
}

export default App

