
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createCollection, useLiveSuspenseQuery } from "@tanstack/react-db"

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
                            type="button">{todo.name} {todo.done && "✅"}
                        </button>
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

