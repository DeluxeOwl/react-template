import * as z from "zod"

import { TodoNameMinLength } from "./todo"

const todoPublicIdSchema = z.string().regex(
    /^todo_[\dA-Za-z]{22}$/,
    { message: "Invalid todo public ID format (expected todo_<22 base62 chars>)" },
)

// Schema definitions, used for forms, http communication etc.

// This is for http
export const TodoOutputHTTPSchema = z.object({
    done: z.boolean(),
    id:   todoPublicIdSchema,
    name: z.string().min(TodoNameMinLength),
})

export const CreateTodoInputHTTPSchema = z.object({
    // Note: We allow client side id generation, works really well with tanstack db.
    id:   todoPublicIdSchema.optional(),
    name: z.string().min(TodoNameMinLength),
})

export const ToggleTodoInputHTTPSchemaParams = z.object({
    id: todoPublicIdSchema,
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
