import { match } from "ts-pattern"

type TodoInputAction
    = | { text: string, type: "textChanged" }
        | { type: "submitted" }

export function todoInputReducer(_: string, action: TodoInputAction): string {
    return match(action)
        .with({ type: "textChanged" }, ({ text }) => text)
        .with({ type: "submitted" }, () => "")
        .exhaustive()
}
