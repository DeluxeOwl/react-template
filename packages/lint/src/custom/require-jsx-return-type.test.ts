/* eslint-disable vitest/require-hook */
import tseslint from "typescript-eslint"
import {
    it, afterAll, describe,
} from "vitest"
import { RuleTester } from "@typescript-eslint/rule-tester"

import { requireJSXReturnTypeRule } from "./require-jsx-return-type"

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
    languageOptions: {
        parser:        tseslint.parser,
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
            ecmaVersion: 2020,
            sourceType:  "module",
        },
    },
})

describe("require-jsx-return-type", () => {
    ruleTester.run("require-jsx-return-type", requireJSXReturnTypeRule, {
        invalid: [
            // The motivating example: destructured, typed props, no return type.
            {
                code: `function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex", className)} data-slot="empty-content" {...props} />
    )
}`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `function EmptyContent({ className, ...props }: React.ComponentProps<"div">): React.ReactNode {
    return (
        <div className={cn("flex", className)} data-slot="empty-content" {...props} />
    )
}`,
            },
            // Function declaration, no params.
            {
                code:   `function Card() { return <div /> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `function Card(): React.ReactNode { return <div /> }`,
            },
            // Exported function declaration returning a fragment.
            {
                code:   `export function Card() { return <><span /></> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `export function Card(): React.ReactNode { return <><span /></> }`,
            },
            // Anonymous default export.
            {
                code:   `export default function () { return <div /> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `export default function (): React.ReactNode { return <div /> }`,
            },
            // Arrow function with expression body.
            {
                code:   `export const Card = () => <div />`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `export const Card = (): React.ReactNode => <div />`,
            },
            // Arrow function with block body.
            {
                code:   `const Card = (props: Props) => { return <div {...props} /> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `const Card = (props: Props): React.ReactNode => { return <div {...props} /> }`,
            },
            // Parenless single-param arrow must gain parentheses.
            {
                code:   `const Card = props => <div {...props} />`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `const Card = (props): React.ReactNode => <div {...props} />`,
            },
            // Parenthesized arrow body.
            {
                code:   `const Card = () => (<div />)`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `const Card = (): React.ReactNode => (<div />)`,
            },
            // Function expression assigned to a PascalCase binding.
            {
                code:   `const Card = function () { return <div /> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `const Card = function (): React.ReactNode { return <div /> }`,
            },
            // Wrapped in memo().
            {
                code:   `const Card = memo(() => <div />)`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `const Card = memo((): React.ReactNode => <div />)`,
            },
            // Conditional JSX return.
            {
                code:   `function Card({ ok }: Props) { return ok ? <div /> : null }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `function Card({ ok }: Props): React.ReactNode { return ok ? <div /> : null }`,
            },
            // Logical JSX return.
            {
                code:   `function Card({ ok }: Props) { return ok && <div /> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `function Card({ ok }: Props): React.ReactNode { return ok && <div /> }`,
            },
            // Early return of null still counts as a JSX component.
            {
                code:   `function Card({ ok }: Props) { if (!ok) { return null } return <div /> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `function Card({ ok }: Props): React.ReactNode { if (!ok) { return null } return <div /> }`,
            },
            // Async component.
            {
                code:   `async function Card() { return <div /> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `async function Card(): React.ReactNode { return <div /> }`,
            },
            // Nested callback JSX must not mark the outer component as done.
            {
                code:   `function List({ items }: Props) { return <ul>{items.map((i) => <li key={i} />)}</ul> }`,
                errors: [{ messageId: "missingJSXReturnType" }],
                output: `function List({ items }: Props): React.ReactNode { return <ul>{items.map((i) => <li key={i} />)}</ul> }`,
            },
            // Custom type name option.
            {
                code:    `const Card = () => <div />`,
                errors:  [{ messageId: "missingJSXReturnType" }],
                options: [{ typeName: "JSX.Element" }],
                output:  `const Card = (): JSX.Element => <div />`,
            },
            // checkAllFunctions also flags non-component callbacks.
            {
                code:    `const render = () => <div />`,
                errors:  [{ messageId: "missingJSXReturnType" }],
                options: [{ checkAllFunctions: true }],
                output:  `const render = (): React.ReactNode => <div />`,
            },
        ],
        valid: [
            // Already annotated.
            { code: `function Card(): React.ReactNode { return <div /> }` },
            { code: `const Card = (): React.ReactNode => <div />` },
            { code: `export default function Page(): React.ReactNode { return <div /> }` },
            // Contextual type on the binding pins the return type already.
            { code: `const Card: React.FC = () => <div />` },
            // Inline callbacks are not components.
            { code: `items.map((item) => <li key={item} />)` },
            { code: `const render = () => <div />` },
            // Non-JSX functions are untouched.
            { code: `function useThing() { return 1 }` },
            { code: `function Card() { return null }` },
            { code: `const compute = () => 1 + 2` },
            // Only the inner callback returns JSX, and it is not a component.
            { code: `function useRows() { return rows.map((r) => <li key={r} />) }` },
        ],
    })
})
