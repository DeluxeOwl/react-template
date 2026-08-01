
import { Result } from "@praha/byethrow"
import { ErrorFactory } from "@praha/error-factory"
import {
    type PublicId, Base62UUIDLength, createPublicIdCodec,
} from "@react-template/kernel/id-utils"

export const TodoNameMinLength = 1
export const TodoPublicIdPrefix = "todo" as const

const TodoPublicIdCodec = createPublicIdCodec(TodoPublicIdPrefix)

// Just the shape `todo_${string}`, no nominal brand.
//
// We tried branding this (a `Brand<T, N>` built on a unique symbol) so that an
// arbitrary string could not be used where an id is expected. Verdict: imo not
// worth it in practice here, and not a huge deal either way. It only pays off when
// functions take the id as a *parameter*, so callers get caught passing the
// wrong thing. Here the id is a private field on the entity, and the repository
// port and commands take plain strings, so the brand guarded nothing while
// adding casts at every boundary that widened back to string (fromDTO, the DTO,
// the sqlite adapter, the zod schemas).
//
// Worth revisiting if ids start getting passed between aggregates, or if a
// second id type appears that could be confused with this one. The brand only
// earns its keep once TodoPublicId reaches the port and the commands, so
// validation happens once at the edge and the type carries the proof inward.
export type TodoPublicId = PublicId<typeof TodoPublicIdPrefix>

export function generateTodoPublicId(): TodoPublicId {
    return TodoPublicIdCodec.generate()
}

export function isValidTodoPublicId(id: string): id is TodoPublicId {
    return TodoPublicIdCodec.isValid(id)
}

// These are all domain errors.

export class NameLengthError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ length: number }>(),
    message: `name length must be greater than ${TodoNameMinLength}`,
    name:    "NameLengthError",
}) {}

export class InvalidPublicIdError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ id: string }>(),
    message: `invalid public id format, expected ${TodoPublicIdPrefix}_<${Base62UUIDLength} base62 chars>`,
    name:    "InvalidPublicIdError",
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
            id:   string
            name: string
        },
    ) {}

    static create(name: string, publicId?: string): Result.Result<Todo, InvalidPublicIdError | NameLengthError> {
        if (name.length < TodoNameMinLength) {
            return Result.fail(new NameLengthError({
                length: name.length,
            }))
        }

        const id = publicId ?? generateTodoPublicId()

        if (!isValidTodoPublicId(id)) {
            return Result.fail(new InvalidPublicIdError({ id }))
        }

        return Result.succeed(new Todo({
            done: false,
            id,
            name,
        }))
    }

    // Rehydration from a trusted store: the id was validated by `create` before
    // it was ever persisted, so it is not re-checked here.
    static fromDTO(data: TodoDTO): Todo {
        return new Todo({
            done: data.done,
            id:   data.id,
            name: data.name,
        })
    }

    // Exposes internal state to adapters.
    toDTO(): TodoDTO {
        return {
            done: this.state.done,
            id:   this.state.id,
            name: this.state.name,
        }
    }

    toggle(): void {
        this.state.done = !this.state.done
    }
}
