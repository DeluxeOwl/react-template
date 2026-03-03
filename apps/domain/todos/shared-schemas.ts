import * as z from "zod"
// Schema definitions, used for forms, http communication etc.

export const TodoOutputSchema = z.object({
    done: z.boolean(),
    id:   z.uuidv4(),
    name: z.string().min(1),
})

export const CreateTodoInputSchema = TodoOutputSchema.omit({
    done: true,
    id:   true,
})

export const UpdateTodoInputSchema = z.object({
    body: z.object({
        done: z.boolean().optional(),
        name: z.string().optional(),
    }),
    params: z.object({
        id: z.uuidv4(),
    }),
})

export const ListTodosOutputSchema = z.object({
    data: z.array(TodoOutputSchema),
})

export type TodoOutput = z.infer<typeof TodoOutputSchema>
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>
export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>
export type ListTodosOutput = z.infer<typeof ListTodosOutputSchema>
