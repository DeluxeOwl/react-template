
import * as errore from "errore"
import { TypeID, typeid } from "typeid-js"

export const TodoNameMinLength = 1

const TodoIDPrefix = "todo" as const
export type TodoID = TypeID<typeof TodoIDPrefix>

export function generateTodoID(): TodoID {
    return typeid(TodoIDPrefix)
}

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

            id:   generateTodoID(),
            name: name,
        })
    }

    static fromDTO(data: TodoDTO): Todo {
        return new Todo({
            done: data.done,
            id:   TypeID.fromString(data.id, TodoIDPrefix),
            name: data.name,
        })
    }

    // Exposes internal state to adapters.
    toDTO(): TodoDTO {
        return {
            done: this.state.done,
            id:   this.state.id.toString(),
            name: this.state.name,
        }
    }

    toggle(): void {
        this.state.done = !this.state.done
    }
}
