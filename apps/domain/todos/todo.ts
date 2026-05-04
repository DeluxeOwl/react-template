
import { Result } from "@praha/byethrow"
import { ErrorFactory } from "@praha/error-factory"

export const TodoNameMinLength = 1
export const TodoPublicIdPrefix = "todo" as const
const Base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const Base62UUIDLength = 22
const TodoPublicIDRegex = new RegExp(`^${TodoPublicIdPrefix}_[0-9A-Za-z]{${Base62UUIDLength}}$`)

function bigintToBase62(num: bigint): string {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (num === 0n) {
        return "0"
    }
    let result = ""
    const base = 62n
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    while (num > 0n) {
        result = Base62Chars[Number(num % base)] + result
        num /= base
    }
    return result
}

function uuidToBase62(uuid: string): string {
    const hex = uuid.replaceAll("-", "")
    const num = BigInt(`0x${hex}`)
    return bigintToBase62(num).padStart(Base62UUIDLength, "0")
}

export function generateTodoPublicId(): string {
    const uuid = crypto.randomUUID()
    return `${TodoPublicIdPrefix}_${uuidToBase62(uuid)}`
}

export function isValidTodoPublicId(id: string): boolean {
    return TodoPublicIDRegex.test(id)
}

// These are all domain errors.

export class NameLengthError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ length: number }>(),
    message: `name length must be greater than ${TodoNameMinLength}`,
    name:    "NameLengthError",
}) {}

export class InvalidPublicIdError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ id: string }>(),
    message: "invalid public id format, expected todo_<22 base62 chars>",
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
