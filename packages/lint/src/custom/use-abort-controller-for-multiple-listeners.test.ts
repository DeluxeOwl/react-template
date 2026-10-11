/* oxlint-disable vitest-js/require-hook -- RuleTester.run registers its own describe and it blocks */
import { describe } from "vitest"

import { createRuleTester } from "./rule-tester.ts"
import { useAbortControllerForMultipleListenersRule } from "./use-abort-controller-for-multiple-listeners.ts"

// These cases were checked against the ast-grep rule this one replaces (until 0.5.0): both flag
// the same statements, including where the old rule had gaps. Columns are 0-based, as in
// oxlint's RuleTester.

const ruleTester = createRuleTester("tsx")
const error = { messageId: "useAbortController" }

/** `lines` as the body of a `useEffect` callback, one per line from line 2. */
function inEffect(...lines: string[]): string {
    return ["useEffect(() => {", ...lines.map((line) => `    ${line}`), "}, [])"].join("\n")
}

describe("use-abort-controller-for-multiple-listeners", () => {
    ruleTester.run("use-abort-controller-for-multiple-listeners", useAbortControllerForMultipleListenersRule, {
        invalid: [
            // The first of two listener statements, the first two of three.
            {
                code:   inEffect("window.addEventListener(\"scroll\", onScroll)", "window.addEventListener(\"resize\", onResize)"),
                errors: [
                    {
                        column: 4, line: 2, messageId: "useAbortController",
                    },
                ],
            },
            {
                code:   inEffect("a.addEventListener(\"x\", f)", "b.addEventListener(\"y\", g)", "c.addEventListener(\"z\", h)"),
                errors: [
                    {
                        column: 4, line: 2, messageId: "useAbortController",
                    }, {
                        column: 4, line: 3, messageId: "useAbortController",
                    },
                ],
            },
            // A signal on the second call doesn't help the first.
            { code: inEffect("a.addEventListener(\"x\", f)", "b.addEventListener(\"y\", g, { signal })"), errors: [error] },
            // Options without a `signal` property: none, a variable, a quoted key, a fourth argument.
            { code: inEffect("a.addEventListener(\"x\", f, { once: true })", "b.addEventListener(\"y\", g)"), errors: [error] },
            { code: inEffect("a.addEventListener(\"x\", f, options)", "b.addEventListener(\"y\", g)"), errors: [error] },
            { code: inEffect("a.addEventListener(\"x\", f, { \"signal\": s })", "b.addEventListener(\"y\", g)"), errors: [error] },
            { code: inEffect("a.addEventListener(\"x\", f, { signal }, extra)", "b.addEventListener(\"y\", g)"), errors: [error] },
            // Still directly followed: a blank line, a comment after a statement without a semicolon,
            // two statements on a line.
            { code: inEffect("a.addEventListener(\"x\", f)", "", "b.addEventListener(\"y\", g)"), errors: [error] },
            { code: inEffect("a.addEventListener(\"x\", f) // scroll", "b.addEventListener(\"y\", g)"), errors: [error] },
            { code: inEffect("a.addEventListener(\"x\", f); b.addEventListener(\"y\", g)"), errors: [error] },
            // A listener call anywhere in a statement, and statements anywhere in the effect.
            { code: inEffect("elements.forEach((el) => el.addEventListener(\"x\", f))", "window.addEventListener(\"y\", g)"), errors: [error] },
            {
                code:   inEffect("const attach = () => {", "    a.addEventListener(\"x\", f)", "    b.addEventListener(\"y\", g)", "}"),
                errors: [
                    {
                        column: 8, line: 3, messageId: "useAbortController",
                    },
                ],
            },
            { code: inEffect("switch (kind) {", "    case 1: a.addEventListener(\"x\", f); b.addEventListener(\"y\", g)", "}"), errors: [error] },
        ],
        valid: [
            inEffect("a.addEventListener(\"x\", f, { signal: controller.signal })", "b.addEventListener(\"y\", g, { signal: controller.signal })"),
            inEffect("a.addEventListener(\"x\", f, { signal })", "b.addEventListener(\"y\", g)"),
            inEffect("a.addEventListener(\"x\", f, { ...options, signal })", "b.addEventListener(\"y\", g)"),
            // A `signal` property anywhere in a three-argument listener call of the statement.
            inEffect("a.addEventListener(\"x\", () => fetch(url, { signal }), options)", "b.addEventListener(\"y\", g)"),
            inEffect("a.addEventListener(\"x\", f), b.addEventListener(\"y\", g, { signal })", "c.addEventListener(\"z\", h)"),
            inEffect("a.addEventListener(\"x\", f)"),
            inEffect("a.addEventListener(\"x\", f)", "a.removeEventListener(\"x\", f)"),
            // Something between the two statements: a statement, a comment on its own line or after a `;`.
            inEffect("a.addEventListener(\"x\", f)", "count += 1", "b.addEventListener(\"y\", g)"),
            inEffect("a.addEventListener(\"x\", f)", "// resize", "b.addEventListener(\"y\", g)"),
            inEffect("a.addEventListener(\"x\", f); // scroll", "b.addEventListener(\"y\", g)"),
            // Not expression statements one after the other.
            inEffect("const off = a.addEventListener(\"x\", f)", "b.addEventListener(\"y\", g)"),
            inEffect("if (ready) a.addEventListener(\"x\", f)", "b.addEventListener(\"y\", g)"),
            // Not `useEffect(…)`, or not plain calls.
            "React.useEffect(() => { a.addEventListener(\"x\", f); b.addEventListener(\"y\", g) }, [])",
            "useLayoutEffect(() => { a.addEventListener(\"x\", f); b.addEventListener(\"y\", g) }, [])",
            "function attach() { a.addEventListener(\"x\", f); b.addEventListener(\"y\", g) }",
            inEffect("a?.addEventListener(\"x\", f)", "b?.addEventListener(\"y\", g)"),
        ],
    })
})
