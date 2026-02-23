import * as z from "zod"
import { oc, type ContractRouterClient } from "@orpc/contract"

export const TodoSchema = z.object({
    done: z.boolean(),
    id:   z.uuidv4(),
    name: z.string().min(1),
})

export type Todo = z.infer<typeof TodoSchema>

const createTodoContract = oc.input(
    TodoSchema.omit({ done: true, id: true }),
).output(TodoSchema)

const updateTodoContract = oc.route({
    inputStructure: "detailed",
    method:         "PUT",
    path:           "/todos/{id}",
}).input(z.object({
    body: z.object({
        done: z.boolean().optional(),
        name: z.string().optional(),
    }),
    params: z.object({ id: z.uuidv4() }),
}))

const listTodosContract = oc.output(z.object({
    data: z.array(TodoSchema),
})).route({
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
