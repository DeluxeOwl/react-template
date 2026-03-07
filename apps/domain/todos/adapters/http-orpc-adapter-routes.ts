import { oc, type ContractRouterClient } from "@orpc/contract"

import { TodoOutputHTTPSchema, CreateTodoInputHTTPSchema, ListTodosOutputHTTPSchema, ToggleTodoInputHTTPSchema } from "./http-orpc-adapter-schemas"

const createTodoContract = oc.route({
    inputStructure: "detailed",
    method:         "POST",
    path:           "/todos/create",
})
    .input(CreateTodoInputHTTPSchema)
    .output(TodoOutputHTTPSchema)

const toggleTodoContract = oc.route({
    inputStructure: "detailed",
    method:         "POST",
    path:           "/todos/{id}/toggle",
}).input(ToggleTodoInputHTTPSchema)

const listTodosContract = oc
    .output(ListTodosOutputHTTPSchema)
    .route({
        inputStructure: "detailed",
        method:         "GET",
        path:           "/todos",
    })

export const contract = {
    todos: {
        create: createTodoContract,
        list:   listTodosContract,
        toggle: toggleTodoContract,
    },
} as const

export type ContractTypeClient = ContractRouterClient<typeof contract>
