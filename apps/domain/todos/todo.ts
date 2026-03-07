
import type * as z from "zod"

import * as errore from "errore"

export const TodoNameMinLength = 1

export type TodoID = string & z.$brand<"TodoID">

// These are all domain errors.
export class TodoError extends Error {}

export class NameLengthError extends errore.createTaggedError({
    extends: TodoError,
    message: "name length $length must be greater than $lengthMin",
    name:    "NameLengthError",
}) {}

// This is used by repositories and adapters to convert to their respective types.
// It's not necessarily the same as the internal state, just what the domain model
// wants to make 'read only'.
export interface TodoDTO {
    id:   string
    name: string
    done: boolean
}

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
            return new NameLengthError({ length: name.length, lengthMin: TodoNameMinLength })
        }

        return new Todo({
            done: false,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            id:   crypto.randomUUID() as TodoID,
            name: name,
        })
    }

    static fromDTO(data: TodoDTO): Todo {
        return new Todo({
            done: data.done,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            id:   data.id as TodoID,
            name: data.name,
        })
    }

    // Exposes internal state to adapters.
    toDTO(): TodoDTO {
        return this.state
    }

    toggle(): void {
        this.state.done = !this.state.done
    }
}
