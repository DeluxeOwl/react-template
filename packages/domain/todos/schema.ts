import * as z from "zod"

export const TodoSchema = z.object({
    done: z.boolean(),
    id:   z.uuidv4(),
    name: z.string().min(1),
})

export type Todo = z.infer<typeof TodoSchema>
