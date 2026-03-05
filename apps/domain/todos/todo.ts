
import type * as z from "zod"

import * as errore from "errore"

export const TodoNameMinLength = 1

export type TodoID = string & z.$brand<"TodoID">

// Shared functionality.
export class TodoError extends Error {}

export class NameLengthError extends errore.createTaggedError({
    extends: TodoError,
    message: "name length must be less than $length",
    name:    "NameLengthError",
}) {}

export class Todo {
    private constructor(
        private state: {
            done: boolean
            id:   TodoID
            name: string
        },
    ) {}

    static create(name: string): NameLengthError | Todo {
        if (name.length < TodoNameMinLength) {
            return new NameLengthError({ length: name.length })
        }

        return new Todo({
            done: false,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            id:   crypto.randomUUID() as TodoID,
            name: name,
        })
    }

    toggle(): void {
        this.state.done = !this.state.done
    }
}
