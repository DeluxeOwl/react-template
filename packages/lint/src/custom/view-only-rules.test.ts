/* oxlint-disable vitest-js/require-hook -- RuleTester.run registers its own describe and it blocks */
import { describe } from "vitest"

import { createRuleTester } from "./rule-tester.ts"
import {
    noLoopsInComponentRule,
    noFilterInComponentRule,
    noSwitchInComponentRule,
    noLogicInMapCallbackRule,
    noArrayMethodsInComponentRule,
    noBuiltinHooksInComponentRule,
    noObjectSpreadInComponentRule,
    noMultipleHooksInComponentRule,
    noLogicExpressionsInComponentRule,
    noTernaryAssignmentInComponentRule,
} from "./view-only-rules.ts"

// These cases were checked against the ast-grep rules the oxlint ones replace (until 0.5.0):
// both flag the same nodes, including where the old rules had gaps. Columns are 0-based, as in
// oxlint's RuleTester.

const ruleTester = createRuleTester("tsx")
const error = { messageId: "viewOnly" }

/** `body` inside a component: an arrow function that renders nested JSX. */
function inComponent(body: string): string {
    return `const Card = () => {
    ${body}
    return <div><span /></div>
}`
}

describe("what counts as a component (no-switch-in-component)", () => {
    ruleTester.run("no-switch-in-component", noSwitchInComponentRule, {
        invalid: [
            {
                code:   inComponent("switch (x) {}"),
                errors: [
                    {
                        column: 4, line: 2, messageId: "viewOnly",
                    },
                ],
            },
            { code: "function Card() { switch (x) {} return <div><span /></div> }", errors: [error] },
            // Fragments count, outside and inside.
            { code: "const Card = () => { switch (x) {} return <><span /></> }", errors: [error] },
            { code: "const Card = () => { switch (x) {} return <div><></></div> }", errors: [error] },
            // JSX in an attribute of an element with a closing tag.
            { code: "const Card = () => { switch (x) {} return <Foo icon={<Bar />}>text</Foo> }", errors: [error] },
            { code: "const Card = () => { switch (x) {} return <ul>{xs.map((x) => <li key={x} />)}</ul> }", errors: [error] },
            // Inside a callback in a component.
            { code: "const Card = () => { const f = () => { switch (x) {} }; return <div><span /></div> }", errors: [error] },
            // The JSX may be in an inner function, and a function that contains a component is one too.
            { code: "function Card() { switch (x) {} const render = () => <div><span /></div>; return render() }", errors: [error] },
            { code: "function outer() { switch (x) {} const Card = () => <div><span /></div>; return Card }", errors: [error] },
            { code: "export default () => { switch (x) {} return <div><span /></div> }", errors: [error] },
            { code: "class Page { render = () => { switch (x) {} return <div><span /></div> } }", errors: [error] },
            { code: "const Card = memo(<T,>(props: T) => { switch (x) {} return <div><span /></div> })", errors: [error] },
        ],
        valid: [
            // No JSX inside the outer element: a simple wrapper such as a provider.
            "const Wrap = () => { switch (x) {} return <Ctx.Provider value={v}>{children}</Ctx.Provider> }",
            "const Card = () => { switch (x) {} return <div>text</div> }",
            // No closing tag on the outer element.
            "const Card = () => { switch (x) {} return <Foo /> }",
            "const Card = () => { switch (x) {} return <Foo icon={<Bar />} /> }",
            // Function expressions, methods, generators and anonymous default exports are not components.
            "const Card = function () { switch (x) {} return <div><span /></div> }",
            "const Card = forwardRef(function Card(props, ref) { switch (x) {} return <div><span /></div> })",
            "class Page { render() { switch (x) {} return <div><span /></div> } }",
            "const page = { render() { switch (x) {} return <div><span /></div> } }",
            "function* Rows() { switch (x) {} yield <div><span /></div> }",
            "export default function () { switch (x) {} return <div><span /></div> }",
            // A helper next to a component.
            "function helper() { switch (x) {} } const Card = () => <div><span /></div>",
        ],
    })
})

describe("no-builtin-hooks-in-component", () => {
    ruleTester.run("no-builtin-hooks-in-component", noBuiltinHooksInComponentRule, {
        invalid: [
            {
                code:   inComponent("const [count] = useState(0)"),
                errors: [
                    {
                        column: 20, line: 2, messageId: "viewOnly",
                    },
                ],
            },
            { code: inComponent("useEffect(() => {}, [])"), errors: [error] },
            {
                code:   inComponent("const id = useId(); const ref = useRef(null); const value = useContext(Ctx); const [state, dispatch] = useReducer(reduce, 0)"),
                errors: [error, error, error, error],
            },
            {
                code:   inComponent("const memo = useMemo(() => 1, []); const cb = useCallback(() => 1, []); const [pending] = useTransition(); const deferred = useDeferredValue(v)"),
                errors: [error, error, error, error],
            },
            {
                code:   inComponent("useLayoutEffect(f); useInsertionEffect(f); useImperativeHandle(ref, f); useDebugValue(1); const s = useSyncExternalStore(a, b)"),
                errors: [error, error, error, error, error],
            },
            { code: inComponent("const [s, act] = useActionState(f, 0); const o = useOptimistic(s); const e = useEffectEvent(f)"), errors: [error, error, error] },
            // Inside a callback in the component.
            { code: inComponent("const make = () => useState(0)"), errors: [error] },
            { code: inComponent("const [value] = useState(/* initial */ 0)"), errors: [error] },
        ],
        valid: [
            inComponent("const data = useSuspenseQuery(options)"),
            inComponent("const value = use(promise)"),
            // Calls the old pattern `useState($$$)` didn't match.
            inComponent("const [count] = React.useState(0)"),
            inComponent("const [count] = useState<number>(0)"),
            inComponent("const ref = useRef<HTMLDivElement>(null)"),
            inComponent("const [count] = useState?.(0)"),
            inComponent("const [count] = (useState)(0)"),
            inComponent("const [count] = useState /* why */ (0)"),
            // Not a component.
            "function useCounter() { const [count] = useState(0); return count }",
            "const Card = () => { const [count] = useState(0); return <div>{count}</div> }",
        ],
    })
})

describe("no-filter-in-component", () => {
    ruleTester.run("no-filter-in-component", noFilterInComponentRule, {
        invalid: [
            {
                code:   inComponent("const active = users.filter((user) => user.active)"),
                errors: [
                    {
                        column: 19, line: 2, messageId: "viewOnly",
                    },
                ],
            },
            { code: "const List = () => <ul>{xs.filter(f).map((x) => <li key={x} />)}</ul>", errors: [error] },
            { code: inComponent("const active = users.filter(/* why */ isActive)"), errors: [error] },
        ],
        valid: [
            "function active(users) { return users.filter((user) => user.active) }",
            inComponent("const active = users?.filter(isActive)"),
            inComponent("const active = users.filter<User>(isActive)"),
            inComponent("const active = (users.filter)(isActive)"),
            inComponent("const active = users[\"filter\"](isActive)"),
            inComponent("const active = users /* why */ .filter(isActive)"),
            inComponent("const active = users\n        // why\n        .filter(isActive)"),
        ],
    })
})

describe("no-array-methods-in-component", () => {
    ruleTester.run("no-array-methods-in-component", noArrayMethodsInComponentRule, {
        invalid: [
            {
                code:   inComponent("const r = [xs.reduce(f, 0), xs.find(f), xs.findIndex(f), xs.some(f), xs.every(f), xs.flatMap(f)]"),
                errors: [error, error, error, error, error, error],
            },
            {
                code:   inComponent("const r = [xs.sort(), xs.slice(1), xs.concat(ys), xs.includes(1), xs.toSorted(), xs.toReversed()]"),
                errors: [error, error, error, error, error, error],
            },
            {
                code:   inComponent("const r = [xs.toSpliced(1), xs.with(0, 1), xs.findLast(f), xs.findLastIndex(f), xs.at(-1), xs.flat()]"),
                errors: [error, error, error, error, error, error],
            },
            { code: inComponent("const groups = Object.groupBy(xs, (x) => x.kind)"), errors: [error] },
            // Any object's methods, strings too.
            { code: inComponent("const isAdmin = role.includes(\"admin\")"), errors: [error] },
            { code: inComponent("const last = (xs).at(-1)!"), errors: [error] },
            // Only the plain call of the chain.
            {
                code:   inComponent("const first = xs.find(f)?.at(0)"),
                errors: [
                    {
                        column: 18, line: 2, messageId: "viewOnly",
                    },
                ],
            },
        ],
        valid: [
            inComponent("const r = [xs.map(f), xs.forEach(f), xs.join(), xs.indexOf(1), xs.reverse(), xs.keys()]"),
            // `toReversed` only without arguments, `Object.groupBy` only with two or more.
            inComponent("const r = [xs.toReversed(1), Object.groupBy(xs), Map.groupBy(xs, f)]"),
            inComponent("const r = [xs?.find(f), xs.reduce<number>(f, 0), xs[\"find\"](f)]"),
        ],
    })
})

describe("no-logic-expressions-in-component", () => {
    ruleTester.run("no-logic-expressions-in-component", noLogicExpressionsInComponentRule, {
        invalid: [
            {
                code:   inComponent("const doubled = count * 2"),
                errors: [
                    {
                        column: 4, line: 2, messageId: "viewOnly",
                    },
                ],
            },
            { code: inComponent("let total = a + b"), errors: [error] },
            { code: inComponent("const r = [a && b, a ?? b, a === b, a instanceof B, \"key\" in a, a ** 2]"), errors: [error] },
            { code: inComponent(`const label = \`\${count + 1} items\``), errors: [error] },
            { code: inComponent("const isPositive = (value) => value > 0"), errors: [error] },
            // `new` is not a call.
            { code: inComponent("const yesterday = new Date(now - 1)"), errors: [error] },
            { code: inComponent("const { size = base + 1 } = props"), errors: [error] },
            { code: inComponent("const element = <div className={a + b} />"), errors: [error] },
            { code: inComponent("const sum = a + b satisfies number"), errors: [error] },
            // The declaration in a function, and the one declaring the function.
            {
                code:   inComponent("const handle = () => { const sum = a + b }"),
                errors: [
                    {
                        column: 4, line: 2, messageId: "viewOnly",
                    }, {
                        column: 27, line: 2, messageId: "viewOnly",
                    },
                ],
            },
        ],
        valid: [
            // A call anywhere in the declaration, including tagged templates and import().
            inComponent("const total = a + sum(b)"),
            inComponent("const onClick = () => setCount(count + 1)"),
            inComponent(`const style = css\`width: \${a + b}px\``),
            inComponent("const module = import(base + name)"),
            inComponent("const r = [!a, -a, a as number, a!]"),
            inComponent("var total = a + b"),
            inComponent("for (let i = 0; i < n; i += 1) {}"),
            inComponent("let total = 0; total += 1"),
            inComponent("const value: A | B = other"),
        ],
    })
})

describe("no-object-spread-in-component", () => {
    ruleTester.run("no-object-spread-in-component", noObjectSpreadInComponentRule, {
        invalid: [
            {
                code:   inComponent("const styles = { ...base, color: \"red\" }"),
                errors: [
                    {
                        column: 4, line: 2, messageId: "viewOnly",
                    },
                ],
            },
            { code: inComponent("const all = [...a, ...b]"), errors: [error] },
            { code: inComponent("const max = Math.max(...values)"), errors: [error] },
            { code: inComponent("const date = new Date(...parts)"), errors: [error] },
            { code: inComponent("const button = <button {...props} />"), errors: [error] },
            { code: inComponent("const list = <ul>{...items}</ul>"), errors: [error] },
            { code: inComponent("const nested = { a: { b: [...c] } }"), errors: [error] },
        ],
        valid: [
            // Rest patterns and rest parameters are not spreads.
            inComponent("const { a, ...rest } = props"),
            inComponent("const [first, ...others] = items"),
            inComponent("const log = (...args) => args"),
            // Not in a declaration.
            "const Card = (props) => <div {...props}><span /></div>",
        ],
    })
})

describe("no-ternary-assignment-in-component", () => {
    ruleTester.run("no-ternary-assignment-in-component", noTernaryAssignmentInComponentRule, {
        invalid: [
            {
                code:   inComponent("const role = isAdmin ? \"admin\" : \"user\""),
                errors: [
                    {
                        column: 4, line: 2, messageId: "viewOnly",
                    },
                ],
            },
            { code: inComponent("let role = isAdmin ? a : b"), errors: [error] },
            { code: inComponent("const badge = <div>{isAdmin ? <i /> : null}</div>"), errors: [error] },
            { code: inComponent("const pick = () => (isAdmin ? 1 : 2)"), errors: [error] },
            { code: inComponent("const total = (isAdmin ? 1 : 2) + count()"), errors: [error] },
        ],
        valid: [
            "const Card = () => <div>{isAdmin ? <i /> : <span />}</div>",
            inComponent("type Value<T> = T extends string ? \"text\" : \"other\""),
        ],
    })
})

// ast-grep's rule never matched anything; these cases were checked against it with the third hook
// condition moved to the declaration (docs/oxlint-migration.md, Q-018).
describe("no-multiple-hooks-in-component", () => {
    ruleTester.run("no-multiple-hooks-in-component", noMultipleHooksInComponentRule, {
        invalid: [
            {
                code: `const Foo = () => {
    const { users } = useUsers()
    const { theme } = useTheme()
    const { foo } = useSomething()
    return <div style={theme}><span>{users.length}</span></div>
}`,
                errors: [
                    {
                        column: 4, line: 4, messageId: "viewOnly",
                    },
                ],
            },
            { code: inComponent("const a = useA(); const b = useB(); const c = useC(); const d = useD()"), errors: [error, error] },
            { code: inComponent("const a = useA(); const x = 1; let b = useB(); save(); let c = useC()"), errors: [error] },
            // Builtin hooks count, and so do the calls the other rules' patterns miss.
            { code: inComponent("const [count] = useState<number>(0); const store = useStore.getState(); const value = useValue?.()"), errors: [error] },
            { code: inComponent("const a = useA(); const b = format(useB()); const onSave = () => useC()"), errors: [error] },
            { code: inComponent("const a = useA(); const b = useB(); const styles = useStyles`color: red`"), errors: [error] },
            { code: "function Card() { const a = useA(); const b = useB(); const c = useC(); return <div><span /></div> }", errors: [error] },
            // Three in a callback's block: the callback's declaration counts once in the component's.
            { code: inComponent("const render = () => { const a = useA(); const b = useB(); const c = useC() }"), errors: [error] },
        ],
        valid: [
            inComponent("const { users } = useUsers(); const { theme } = useTheme()"),
            inComponent("const a = useA(), b = useB(), c = useC()"),
            inComponent("const a = useA(); const b = useB(); useEffect(() => {}, [])"),
            inComponent("const a = useA(); const b = useB(); var c = useC()"),
            inComponent("const a = useA(); const b = useB(); const [c] = React.useState(0); const d = (useD)(); const e = user.load(); const f = useless()"),
            inComponent("const a = useA(); const b = useB(); if (ready) { const c = useC() }"),
            // Not components: a wrapper without nested JSX, and a custom hook.
            `const Provider = () => {
    const a = useA()
    const b = useB()
    const c = useC()
    return <Ctx.Provider value={{ a, b, c }}>{children}</Ctx.Provider>
}`,
            "function useCard() { const a = useA(); const b = useB(); const c = useC(); return [a, b, c] }",
        ],
    })
})

describe("no-loops-in-component", () => {
    ruleTester.run("no-loops-in-component", noLoopsInComponentRule, {
        invalid: [
            {
                code:   inComponent("for (let i = 0; i < n; i += 1) {}"),
                errors: [
                    {
                        column: 4, line: 2, messageId: "viewOnly",
                    },
                ],
            },
            { code: inComponent("for (const key in object) {}"), errors: [error] },
            { code: inComponent("for (const item of items) {}"), errors: [error] },
            { code: inComponent("while (running) {} do {} while (running)"), errors: [error, error] },
            {
                code:   inComponent("outer: for (;;) { break outer }"),
                errors: [
                    {
                        column: 11, line: 2, messageId: "viewOnly",
                    },
                ],
            },
            { code: inComponent("items.forEach((item) => { while (item) {} })"), errors: [error] },
            { code: "const Card = async () => { for await (const chunk of stream) {} return <div><span /></div> }", errors: [error] },
        ],
        valid: [
            "function total(items) { let sum = 0; for (const item of items) { sum += item } return sum }",
            inComponent("items.forEach(handle)"),
        ],
    })
})

describe("no-logic-in-map-callback", () => {
    ruleTester.run("no-logic-in-map-callback", noLogicInMapCallbackRule, {
        invalid: [
            {
                code:   "const List = () => <ul>{items.map((item) => { const name = item.name.toUpperCase(); return <li>{name}</li> })}</ul>",
                errors: [
                    {
                        column: 24, line: 1, messageId: "logicInMap",
                    },
                ],
            },
            { code: "const List = () => <ul>{items.map((item) => { let name = item.name; return <li>{name}</li> })}</ul>", errors: [{ messageId: "logicInMap" }] },
            { code: "const List = () => <ul>{items.map((item) => { if (item) { const name = item.name } return <li /> })}</ul>", errors: [{ messageId: "logicInMap" }] },
            { code: "const List = () => <ul>{items.map((item) => { for (let i = 0; i < 1; i += 1) {} return <li /> })}</ul>", errors: [{ messageId: "logicInMap" }] },
            { code: "const List = () => <ul>{items.map(async (item) => { const value = await item; return <li /> })}</ul>", errors: [{ messageId: "logicInMap" }] },
            { code: "const List = () => <ul>{items.map((item) => { function format() { const x = 1 } return <li /> })}</ul>", errors: [{ messageId: "logicInMap" }] },
            // Any arrow function inside the call: a handler in the mapped JSX, or the receiver.
            { code: "const List = () => <ul>{items.map((item) => <li onClick={() => { const id = item.id }} />)}</ul>", errors: [{ messageId: "logicInMap" }] },
            { code: "const List = () => <ul>{load(() => { const a = 1 }).map((item) => <li />)}</ul>", errors: [{ messageId: "logicInMap" }] },
            // Nested maps: both calls.
            {
                code:   "const List = () => <ul>{groups.map((group) => group.items.map((item) => { const name = item.name; return <li>{name}</li> }))}</ul>",
                errors: [
                    {
                        column: 24, line: 1, messageId: "logicInMap",
                    }, {
                        column: 46, line: 1, messageId: "logicInMap",
                    },
                ],
            },
            // Inside JSX anywhere, a fragment too, and outside components.
            { code: "const List = () => <div><Table rows={items.map((item) => { const row = item; return row })} /></div>", errors: [{ messageId: "logicInMap" }] },
            { code: "const List = () => <>{items.map((item) => { const name = item.name; return <li>{name}</li> })}</>", errors: [{ messageId: "logicInMap" }] },
            { code: "const list = <ul>{items.map((item) => { const name = item.name; return <li>{name}</li> })}</ul>", errors: [{ messageId: "logicInMap" }] },
        ],
        valid: [
            "const List = () => <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>",
            "const List = () => <ul>{items.map((item) => { if (!item.isActive) return null; return <li key={item.id}>{item.name}</li> })}</ul>",
            // Not `let`/`const` declarations to tree-sitter.
            "const List = () => <ul>{items.map((item) => { var name = item.name; return <li>{name}</li> })}</ul>",
            "const List = () => <ul>{items.map((item) => { for (const part of item.parts) {} return <li /> })}</ul>",
            // Not inside JSX, or no JSX element with a closing tag around it.
            "const List = () => { const rows = items.map((item) => { const row = item; return row }); return <ul>{rows}</ul> }",
            "const List = () => <Table rows={items.map((item) => { const row = item; return row })} />",
            // Not plain `.map` calls, or not an arrow function.
            "const List = () => <ul>{items?.map((item) => { const name = item.name; return <li>{name}</li> })}</ul>",
            "const List = () => <ul>{items.map<Row>((item) => { const row = item; return row })}</ul>",
            "const List = () => <ul>{items[\"map\"]((item) => { const name = item.name; return <li>{name}</li> })}</ul>",
            "const List = () => <ul>{items.map(function (item) { const name = item.name; return <li>{name}</li> })}</ul>",
        ],
    })
})
