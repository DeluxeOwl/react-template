import { oc, type ContractRouterClient } from "@orpc/contract"

import { TodoOutputHTTPSchema, CreateTodoInputHTTPSchema, ListTodosOutputHTTPSchema, ToggleTodoInputHTTPSchema } from "./adapter-http-schemas"

const commonErrors = {
    INTERNAL_SERVER_ERROR: {},
}

const createTodoContract = oc.route({
    inputStructure: "detailed",
    method:         "POST",
    path:           "/todos/create",
})
    .input(CreateTodoInputHTTPSchema)
    .output(TodoOutputHTTPSchema).errors({
        ...commonErrors,
    })

const toggleTodoContract = oc.route({
    inputStructure: "detailed",
    method:         "POST",
    path:           "/todos/{id}/toggle",
}).input(ToggleTodoInputHTTPSchema).errors({
    ...commonErrors,
    NOT_FOUND: {},
})

const listTodosContract = oc
    .output(ListTodosOutputHTTPSchema)
    .route({
        inputStructure: "detailed",
        method:         "GET",
        path:           "/todos",
    }).errors({
        ...commonErrors,
    })

export const contract = {
    todos: {
        create: createTodoContract,
        list:   listTodosContract,
        toggle: toggleTodoContract,
    },
} as const

export type ContractTypeClient = ContractRouterClient<typeof contract>
