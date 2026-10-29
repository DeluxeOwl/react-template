/* oxlint-disable vitest-js/require-hook -- RuleTester.run registers its own describe and it blocks */
import { describe } from "vitest"

import { noUseStateRule } from "./no-use-state.ts"
import { createRuleTester } from "./rule-tester.ts"

const ruleTester = createRuleTester("tsx")
const error = { messageId: "banned" }

describe("no-use-state", () => {
    ruleTester.run("no-use-state", noUseStateRule, {
        invalid: [
            { code: "const [count, setCount] = useState(0)", errors: [error] },
            { code: "function useCounter() { return useState(0) }", errors: [error] },
            { code: "const Card = () => <div>{useState(0)[0]}</div>", errors: [error] },
            { code: "useState<number>(0)", errors: [error] },
            { code: "useState?.(0)", errors: [error] },
            { code: "(useState)(0)", errors: [error] },
            { code: "(useState as StateHook)(0)", errors: [error] },
            { code: "useState!(0)", errors: [error] },
            { code: "useState /* initial state */ (0)", errors: [error] },
            { code: "React.useState(0)", errors: [error] },
            { code: "React?.useState?.<number>(0)", errors: [error] },
            { code: "import * as hooks from 'react'; hooks.useState(0)", errors: [error] },
            { code: "import R from 'react'; R.useState(0)", errors: [error] },
            { code: "React['useState'](0)", errors: [error] },
            { code: "React[`useState`](0)", errors: [error] },
            { code: "const stateHook = useState; stateHook(0)", errors: [error] },
            { code: "const stateHook = React.useState; stateHook(0)", errors: [error] },
            { code: "consume(useState)", errors: [error] },
            { code: "const hooks = { useState }", errors: [error] },
            { code: "import { useState as stateHook } from 'react'; stateHook(0)", errors: [error] },
            { code: "import { 'useState' as stateHook } from 'react'", errors: [error] },
            { code: "import { useState } from 'react'; useState(0)", errors: [error, error] },
            { code: "const { useState: stateHook } = React; stateHook(0)", errors: [error] },
            { code: "const { useState } = React", errors: [error] },
            { code: "const { ['useState']: stateHook } = React", errors: [error] },
            { code: "const { [`useState`]: stateHook } = React", errors: [error] },
            { code: "function useCounter({ useState: stateHook }) { return stateHook(0) }", errors: [error] },
            { code: "export { useState as stateHook } from 'react'", errors: [error] },
            { code: "export { 'useState' as stateHook } from 'react'", errors: [error] },
            { code: "declare const useState: unknown; export { useState }", errors: [error] },
            { code: "useState(0); useState('')", errors: [error, error] },
            { code: "import * as React from \"react\"; import localState = React.useState; localState(0)", errors: [error] },
            { code: "import localState = React.useState.Member", errors: [error] },
            { code: "import localState = useState.Member", errors: [error] },
            { code: "switch (useState) {}", errors: [error] },
            { code: "@useState class Card {}", errors: [error] },
            { code: "const element = <React.useState />", errors: [error] },
            { code: "const element = <React.useState></React.useState>", errors: [error] },
            { code: "const element = <React.useState.Child />", errors: [error] },
            { code: "const element = <useState.Component />", errors: [error] },
            { code: "React[\"useState\" as const](0)", errors: [error] },
            { code: "React[\"useState\" satisfies keyof typeof React](0)", errors: [error] },
            { code: "React[\"useState\"!](0)", errors: [error] },
            { code: "React[(\"useState\" as const)!](0)", errors: [error] },
            { code: "React[`useState` as const](0)", errors: [error] },
            { code: "React[(\"useState\" as KeyFactory)<number>](0)", errors: [error] },
            { code: "const { [\"useState\" as const]: localState } = React", errors: [error] },
            { code: "const { [\"useState\" satisfies keyof typeof React]: localState } = React", errors: [error] },
            { code: "const stateHook = useState<number>", errors: [error] },
        ],
        valid: [
            "const [count, dispatch] = useReducer(reducer, 0)",
            "function useCounter() { return useReducer(reducer, 0) }",
            "React.useReducer(reducer, 0)",
            "React['useReducer'](reducer, 0)",
            "import { useReducer as stateHook } from 'react'; stateHook(reducer, 0)",
            "const { useReducer: stateHook } = React",
            "export { useReducer } from 'react'",
            "useStatefulStore()",
            "const label = 'useState'",
            "const options = { useState: 'documentation' }",
            "const key = 'useReducer'; React[key](reducer, 0)",
            "import type { useState } from 'react'",
            "import { type useState } from 'react'",
            "export type { useState } from 'react'",
            "export { type useState } from 'react'",
            "type useState = string; const label: useState = ''",
            "type Hook = typeof useState",
            "type Hook = typeof React.useState",
            "interface HookShape extends useState {}",
            "const useState = makeHook()",
            "let useState; useState = makeHook()",
            "class Card implements useState {}",
            "class Card implements React.useState {}",
            "interface HookShape extends React.useState {}",
            "type Hook = import(\"react\").useState",
            "namespace React.useState {}",
            "import localReducer = React.useReducer; localReducer(reducer, 0)",
            "React[\"useReducer\" as const](reducer, 0)",
            "React[\"useReducer\" satisfies keyof typeof React](reducer, 0)",
            "const key = \"useReducer\"; React[key as keyof typeof React](reducer, 0)",
            "const element = <React.useReducer />",
            "const element = <useState />",
            `React[\`use\${kind}\`](0)`,
        ],
    })
})

describe("no-use-state TypeScript assertions", () => {
    const typescriptRuleTester = createRuleTester("ts")

    typescriptRuleTester.run("no-use-state", noUseStateRule, {
        invalid: [
            { code: "React[<string>\"useState\"](0)", errors: [error] },
            { code: "const { [<string>\"useState\"]: localState } = React", errors: [error] },
        ],
        valid: ["React[<string>\"useReducer\"](reducer, 0)"],
    })
})
