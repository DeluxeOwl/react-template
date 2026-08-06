/* eslint-disable vitest/require-hook */
import tseslint from "typescript-eslint"
import {
    it, afterAll, describe,
} from "vitest"
import { RuleTester } from "@typescript-eslint/rule-tester"

import { noProviderWithStaticChildrenRule } from "./no-provider-with-static-children"

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

describe("no-provider-with-static-children", () => {
    ruleTester.run("no-provider-with-static-children", noProviderWithStaticChildrenRule, {
        invalid: [
            // The motivating example.
            {
                code: `function Parent() {
    const [count, setCount] = useState(0)
    return (
        <Context.Provider value={{ count, setCount }}>
            <TreeOfChildren />
        </Context.Provider>
    )
}`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // Arrow component.
            {
                code:   `const Parent = () => { const [c, s] = useState(0); return <Ctx.Provider value={c}><Tree /></Ctx.Provider> }`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // React 19 shorthand: the context object rendered directly.
            {
                code:   `function Parent() { const [c] = useState(0); return <ThemeContext value={c}><Tree /></ThemeContext> }`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // A custom hook counts as state.
            {
                code:   `function Parent() { const store = useStore(); return <Ctx.Provider value={store}><Tree /></Ctx.Provider> }`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // useReducer.
            {
                code:   `function Parent() { const [s, d] = useReducer(r, {}); return <Ctx.Provider value={s}><Tree /></Ctx.Provider> }`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // Namespaced hook call.
            {
                code:   `function Parent() { const [c] = React.useState(0); return <Ctx.Provider value={c}><Tree /></Ctx.Provider> }`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // `children` is forwarded, but a static sibling is still trapped under the provider.
            {
                code:   `function Provider({ children }) { const [c] = useState(0); return <Ctx.Provider value={c}><Modal />{children}</Ctx.Provider> }`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // A list built inside the component is re-created on every render.
            {
                code:   `function Parent({ items }) { const [c] = useState(0); return <Ctx.Provider value={c}>{items.map((i) => <Row key={i} />)}</Ctx.Provider> }`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // A locally created element is not props-provided children.
            {
                code:   `function Parent() { const [c] = useState(0); const tree = <Tree />; return <Ctx.Provider value={c}>{tree}</Ctx.Provider> }`,
                errors: [{ messageId: "providerWithStaticChildren" }],
            },
            // Nested provider inside a stateful component.
            {
                code:   `function Parent({ children }) { const [c] = useState(0); return <A.Provider value={c}><B.Provider value={c}><Tree /></B.Provider></A.Provider> }`,
                errors: [
                    { messageId: "providerWithStaticChildren" },
                    { messageId: "providerWithStaticChildren" },
                ],
            },
            // With requireStateHook disabled, a stateless wrapper is reported too.
            {
                code:    `function App() { return <Ctx.Provider value={theme}><Tree /></Ctx.Provider> }`,
                errors:  [{ messageId: "providerWithStaticChildren" }],
                options: [{ requireStateHook: false }],
            },
            // A hook removed from the ignore list now counts as state.
            {
                code:    `function Parent() { const r = useRef(0); return <Ctx.Provider value={r}><Tree /></Ctx.Provider> }`,
                errors:  [{ messageId: "providerWithStaticChildren" }],
                options: [{ ignoredHooks: [] }],
            },
        ],
        valid: [
            // The fix: the subtree arrives as `children`.
            {
                code: `function CountProvider({ children }) {
    const [count, setCount] = useState(0)
    return <Context.Provider value={{ count, setCount }}>{children}</Context.Provider>
}`,
            },
            // The parent no longer owns the state.
            { code: `function Parent() { return <CountProvider><TreeOfChildren /></CountProvider> }` },
            // `props.children` forwarding.
            { code: `function P(props) { const [c] = useState(0); return <Ctx.Provider value={c}>{props.children}</Ctx.Provider> }` },
            // Conditional forwarding of props.
            { code: `function P({ children, fallback }) { const [c] = useState(0); return <Ctx.Provider value={c}>{c ? children : fallback}</Ctx.Provider> }` },
            // Logical forwarding of props.
            { code: `function P({ children }) { const [c] = useState(0); return <Ctx.Provider value={c}>{c && children}</Ctx.Provider> }` },
            // React 19 shorthand with forwarded children.
            { code: `function P({ children }) { const [c] = useState(0); return <ThemeContext value={c}>{children}</ThemeContext> }` },
            // No re-render trigger in the component, so the subtree is stable.
            { code: `function App() { return <Ctx.Provider value={theme}><Tree /></Ctx.Provider> }` },
            // Ignored hooks do not trigger re-renders on their own.
            { code: `function App() { const r = useRef(0); useEffect(fn); return <Ctx.Provider value={r}><Tree /></Ctx.Provider> }` },
            // Not a context provider.
            { code: `function P() { const [c] = useState(0); return <Layout value={c}><Tree /></Layout> }` },
            // Text children are not element subtrees.
            { code: `function P() { const [c] = useState(0); return <Ctx.Provider value={c}>hello</Ctx.Provider> }` },
            // Comment-only children.
            { code: `function P({ children }) { const [c] = useState(0); return <Ctx.Provider value={c}>{/* nothing */}{children}</Ctx.Provider> }` },
        ],
    })
})
