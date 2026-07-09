import * as z from "zod"
import { oc, type ContractRouterClient } from "@orpc/contract"

import {
    TodoOutputHTTPSchema, CreateTodoInputHTTPSchema, ListTodosOutputHTTPSchema, ToggleTodoInputHTTPSchema,
} from "./adapter-http-schemas"

const sharedErrors = {
    INTERNAL_SERVER_ERROR: {},
}

// For fields that require validation
const sharedErrorsMutating = {
    INPUT_VALIDATION_FAILED: {
        data: z.object({
            fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
            formErrors:  z.array(z.string()),
        }),
        status: 422,
    },
}

const createTodoContract = oc.route({
    method: "POST",
    path:   "/todos/create",
})
    .input(CreateTodoInputHTTPSchema)
    .output(TodoOutputHTTPSchema)
    .errors({
        ...sharedErrors,
        ...sharedErrorsMutating,
    })

const toggleTodoContract = oc.route({
    inputStructure: "detailed",
    method:         "POST",
    path:           "/todos/{id}/toggle",
}).input(ToggleTodoInputHTTPSchema)
    .errors({
        ...sharedErrors,
        ...sharedErrorsMutating,
        NOT_FOUND: {},
    })

const listTodosContract = oc
    .output(ListTodosOutputHTTPSchema)
    .route({
        inputStructure: "detailed",
        method:         "GET",
        path:           "/todos",
    })
    .errors({
        ...sharedErrors,
    })

export const contract = {
    todos: {
        create: createTodoContract,
        list:   listTodosContract,
        toggle: toggleTodoContract,
    },
} as const

export type ContractTypeClient = ContractRouterClient<typeof contract>
