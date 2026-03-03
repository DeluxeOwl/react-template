import { oc, type ContractRouterClient } from "@orpc/contract"

import { TodoOutputSchema, CreateTodoInputSchema, ListTodosOutputSchema, UpdateTodoInputSchema } from "./shared-schemas"

const createTodoContract = oc
    .input(CreateTodoInputSchema)
    .output(TodoOutputSchema)

const updateTodoContract = oc.route({
    inputStructure: "detailed",
    method:         "PUT",
    path:           "/todos/{id}",
}).input(UpdateTodoInputSchema)

const listTodosContract = oc
    .output(ListTodosOutputSchema)
    .route({
        inputStructure: "detailed",
        method:         "GET",
        path:           "/todos",
    })

export const contract = {
    todos: {
        create: createTodoContract,
        list:   listTodosContract,
        update: updateTodoContract,
    },
} as const

export type ContractTypeClient = ContractRouterClient<typeof contract>
