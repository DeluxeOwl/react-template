// Prefixed, url-safe public identifiers.
//
// A public id is a random uuid v4 re-encoded in base62 and prefixed with a
// short type tag, e.g. `todo_3kA9xQ...`. Compared to a raw uuid it is shorter,
// self-describing, and it does not leak a creation timestamp.

export const Base62UUIDLength = 22

const Base62Radix = 62n
const Base62Zero = "0"
const Base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

// Structural: any string of the right shape is assignable. Deliberately not
// branded — see the note on TodoPublicId in packages/core for why we backed out.
//
// To make it nominal later, uncomment the two lines below and wrap PublicId:
//
//   declare const brand: unique symbol
//   export type Brand<Type, BrandName> = Type & { [brand]: BrandName }
//
//   export type PublicId<TPrefix extends string = string> =
//       Brand<`${TPrefix}_${string}`, TPrefix>
//
// Nesting the template literal inside the brand keeps the shape readable in
// hovers and error messages. Two knock-on changes are then required here:
//
//   1. `generate` needs `as PublicId<TPrefix>` — the mint point. `isValid` does
//      not, a type guard narrows on its own.
//   2. Rehydrating an entity from a store (`fromDTO`) needs an escape hatch,
//      since a DTO carries a plain string:
//
//        export function unsafeAsPublicId<TPrefix extends string>(
//            id: string,
//        ): PublicId<TPrefix> {
//            return id as PublicId<TPrefix>
//        }
//
// Both casts trip @typescript-eslint/no-unsafe-type-assertion and need a
// disable comment. That is fine as long as they stay confined to this file —
// it is what keeps the rest of the codebase cast-free.
//
// Only worth doing once ids are passed as function parameters (repository
// ports, command payloads), which is where a caller can actually pass the
// wrong id. Branding a private field alone catches nothing.
export type PublicId<TPrefix extends string = string> = `${TPrefix}_${string}`

export interface PublicIdCodec<TPrefix extends string = string> {
    prefix:   TPrefix
    generate: () => PublicId<TPrefix>
    isValid:  (id: string) => id is PublicId<TPrefix>
}

function bigintToBase62(num: bigint): string {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (num === 0n) {
        return Base62Zero
    }

    let rest = num
    let result = ""

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    while (rest > 0n) {
        result = Base62Chars[Number(rest % Base62Radix)] + result
        rest /= Base62Radix
    }

    return result
}

export function uuidToBase62(uuid: string): string {
    const hex = uuid.replaceAll("-", "")
    return bigintToBase62(BigInt(`0x${hex}`)).padStart(Base62UUIDLength, Base62Zero)
}

// Builds the generator and the validator for one prefix, sharing a single
// compiled pattern. Domains wrap this to name their own id type.
export function createPublicIdCodec<TPrefix extends string>(prefix: TPrefix): PublicIdCodec<TPrefix> {
    const pattern = new RegExp(`^${prefix}_[0-9A-Za-z]{${Base62UUIDLength}}$`)

    return {
        generate: (): PublicId<TPrefix> => `${prefix}_${uuidToBase62(crypto.randomUUID())}`,
        isValid:  (id: string): id is PublicId<TPrefix> => pattern.test(id),
        prefix,
    }
}
