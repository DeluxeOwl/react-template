
import { match } from "ts-pattern"
import { isDefinedError } from "@orpc/client"
import { ErrorBoundary } from "react-error-boundary"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { generateTodoIDString } from "@react-template/domain/todos/todo"
import { createCollection, useLiveSuspenseQuery } from "@tanstack/react-db"
import {
    QueryClient, useMutation, QueryClientProvider, type UseMutationOptions,
} from "@tanstack/react-query"

import { cn } from "~/ui/lib/utils"
import { api, isKnownORPCError } from "~/api"

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

    // Note: tanstack db is weird, this checks only the
    // query error, e.g. if I have an insert error, it wont be tracked here.
    if (todoCollection.utils.isError) {
        // eslint-disable-next-line no-restricted-syntax
        throw todoCollection.utils.lastError
    }

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

type MutationParams<T> = T extends UseMutationOptions<infer TData, infer TError, infer TVariables>
    ? {
            data:      TData
            error:     TError
            variables: TVariables
        }
    : never
type CreateMutation = MutationParams<ReturnType<typeof api.todos.create.mutationOptions>>

function TodoInput(): React.ReactNode {
    // ast-grep-ignore
    const [text, setText] = useState("")

    const mutation = useMutation<void, CreateMutation["error"], CreateMutation["variables"]>({
        mutationFn: async ({ name }) => {
            await todoCollection.insert({
                done: false,
                id:   generateTodoIDString(),
                name: name,
            }).isPersisted.promise
        },
        mutationKey: api.todos.create.mutationKey(),
    })

    return (
        <div className="flex flex-col gap-2">
            <input
                className="border"
                onChange={(e) => {
                    setText(e.currentTarget.value)
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        mutation.mutate({ name: text })
                        setText("")
                    }
                }}
                type="text"
                value={text} />
            <div className={mutation.isError ? "h-10" : "invisible h-10"}>{isDefinedError(mutation.error) && mutation.error.message}</div>
        </div>
    )
}

function App(): React.ReactNode {
    return (
        <QueryClientProvider client={queryClient}>
            <div className={cn("flex flex-col px-2")}>
                <h1 className="font-semibold">To do:</h1>
                <TodoInput />
                <ErrorBoundary fallbackRender={({ error }) => {
                    return match(error)
                        .when(isKnownORPCError, (err) =>
                            // ast-grep-ignore
                            match(err)
                                .with({ code: "INPUT_VALIDATION_FAILED" }, (validationErr) => <p>Bad Form {validationErr.data.formErrors[0]}</p>)
                                .with({ code: "INTERNAL_SERVER_ERROR" }, () => <p>Internal server error</p>)
                                .otherwise(() => <p>Generic ORPC Error</p>),
                        )
                        .otherwise(() => <p>foo</p>)
                }}>
                    <Suspense fallback={<p>Loading...</p>}>
                        <TodoList />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </QueryClientProvider>
    )
}

export default App

