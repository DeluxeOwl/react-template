import { it, describe } from "vitest"
import { RuleTester } from "oxlint/plugins-dev"

// RuleTester registers its cases through these hooks. Vitest's `describe` returns a value and
// RuleTester expects a void function, hence the wrapper.
RuleTester.describe = (text, callback) => {
    describe(text, () => {
        callback()
    })
}
RuleTester.it = it

// `ts` for rules on plain TypeScript (`<T>value` assertions parse), `tsx` for rules on JSX.
export function createRuleTester(lang: "ts" | "tsx"): RuleTester {
    return new RuleTester({
        languageOptions: {
            parserOptions: { lang },
            sourceType:    "module",
        },
    })
}
