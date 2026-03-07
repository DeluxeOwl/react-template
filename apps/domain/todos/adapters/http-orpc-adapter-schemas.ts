import * as z from "zod"

import { TodoNameMinLength } from "../todo"

// Schema definitions, used for forms, http communication etc.

// This is for http
export const TodoOutputHTTPSchema = z.object({
    done: z.boolean(),
    id:   z.uuidv4(),
    name: z.string().min(TodoNameMinLength),
})

export const CreateTodoInputHTTPSchema = TodoOutputHTTPSchema.omit({
    done: true,
    id:   true,
})

export const ToggleTodoInputHTTPSchemaParams = z.object({
    id: z.uuidv4(),
})

export const ToggleTodoInputHTTPSchema = z.object({
    params: ToggleTodoInputHTTPSchemaParams,
})

export const ListTodosOutputHTTPSchema = z.object({
    data: z.array(TodoOutputHTTPSchema),
})

export type TodoOutputHTTP = z.infer<typeof TodoOutputHTTPSchema>
export type CreateTodoInputHTTP = z.infer<typeof CreateTodoInputHTTPSchema>
export type ToggleTodoInputHTTP = z.infer<typeof ToggleTodoInputHTTPSchema>
export type ToggleTodoInputHTTPParams = z.infer<typeof ToggleTodoInputHTTPSchemaParams>
export type ListTodosOutputHTTP = z.infer<typeof ListTodosOutputHTTPSchema>
