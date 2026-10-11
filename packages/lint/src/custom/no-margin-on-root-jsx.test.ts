/* oxlint-disable vitest-js/require-hook -- RuleTester.run registers its own describe and it blocks */
import { describe } from "vitest"

import { createRuleTester } from "./rule-tester.ts"
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx.ts"

const ruleTester = createRuleTester("tsx")

describe("no-margin-on-root-jsx", () => {
    ruleTester.run("no-margin-on-root-jsx", noMarginOnRootJSXRule, {
        invalid: [
        // Basic margin class
            {
                code:   `export const Component = () => <div className="m-4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // An HTML entity in the class string (`&#45;` is "-")
            {
                code:   `export const Component = () => <div className="m&#45;4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin right (mr)
            {
                code:   `export const Component = () => <div className="mr-4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin left (ml)
            {
                code:   `export const Component = () => <div className="ml-2">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin top (mt)
            {
                code:   `export const Component = () => <div className="mt-8">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin bottom (mb)
            {
                code:   `export const Component = () => <div className="mb-4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin x (mx)
            {
                code:   `export const Component = () => <div className="mx-4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin y (my)
            {
                code:   `export const Component = () => <div className="my-4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin start (ms)
            {
                code:   `export const Component = () => <div className="ms-4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin end (me)
            {
                code:   `export const Component = () => <div className="me-2">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin with arbitrary value
            {
                code:   `export const Component = () => <div className="m-[2.3]">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Negative margin
            {
                code:   `export const Component = () => <div className="-m-4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Important margin
            {
                code:   `export const Component = () => <div className="m-4!">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin in style prop
            {
                code:   `export const Component = () => <div style={{ margin: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginTop in style
            {
                code:   `export const Component = () => <div style={{ marginTop: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginRight in style
            {
                code:   `export const Component = () => <div style={{ marginRight: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginBottom in style
            {
                code:   `export const Component = () => <div style={{ marginBottom: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginLeft in style
            {
                code:   `export const Component = () => <div style={{ marginLeft: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginBlock in style
            {
                code:   `export const Component = () => <div style={{ marginBlock: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginBlockStart in style
            {
                code:   `export const Component = () => <div style={{ marginBlockStart: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginBlockEnd in style
            {
                code:   `export const Component = () => <div style={{ marginBlockEnd: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginInline in style
            {
                code:   `export const Component = () => <div style={{ marginInline: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginInlineStart in style
            {
                code:   `export const Component = () => <div style={{ marginInlineStart: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginInlineEnd in style
            {
                code:   `export const Component = () => <div style={{ marginInlineEnd: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginHorizontal in style (React Native style)
            {
                code:   `export const Component = () => <div style={{ marginHorizontal: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // marginVertical in style (React Native style)
            {
                code:   `export const Component = () => <div style={{ marginVertical: 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // String literal margin key in style
            {
                code:   `export const Component = () => <div style={{ "margin": 10 }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin class in template literal
            {
                code:   `export const Component = () => <div className={\`m-4 p-2\`}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin class in conditional expression
            {
                code:   `export const Component = () => <div className={true ? "m-4" : "p-2"}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin class in logical expression
            {
                code:   `export const Component = () => <div className={true && "m-4"}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Margin class in spread props
            {
                code:   `export const Component = () => <div {...{ className: "m-4" }}>Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Export default arrow function with margin
            {
                code:   `export default () => <div className="m-4">Content</div>`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
            // Named export with block return
            {
                code:   `export const Component = () => { return <div className="m-4">Content</div> }`,
                errors: [{ messageId: "noMarginOnRootJSX" }],
            },
        ],
        valid: [
        // No margin - padding only
            {
                code: `export const Component = () => <div className="p-4">Content</div>`,
            },
            // No margin - text classes
            {
                code: `export const Component = () => <div className="text-center">Content</div>`,
            },
            // Style with padding instead of margin
            {
                code: `export const Component = () => <div style={{ padding: 10 }}>Content</div>`,
            },
            // Fragment should be ignored
            {
                code: `export const Component = () => <></>`,
            },
            // Component without margin
            {
                code: `export const Component = () => <Component />`,
            },
            // Margin on nested element is fine
            {
                code: `export const Component = () => <div><span className="m-4">Content</span></div>`,
            },
            // Margin style on nested element
            {
                code: `export const Component = () => <div><span style={{ margin: 10 }}>Content</span></div>`,
            },
            // No margin classes
            {
                code: `export const Component = () => <div className="flex items-center gap-2">Content</div>`,
            },
            // Export default arrow function
            {
                code: `export default () => <div className="p-4">Content</div>`,
            },
            // Named export with variable declaration
            {
                code: `export const Component = () => { return <div className="p-4">Content</div> }`,
            },
            // Function with block body and return
            {
                code: `export const Component = () => { const x = 1; return <div className="p-4">Content</div> }`,
            },
            // No margin in template literal
            {
                code: `export const Component = () => <div className={\`p-4 flex\`}>Content</div>`,
            },
            // No margin in conditional expression
            {
                code: `export const Component = () => <div className={true ? "p-4" : "flex"}>Content</div>`,
            },
            // Margin-like class that isn't actually margin
            {
                code: `export const Component = () => <div className="marker:text-red-500">Content</div>`,
            },
        ],
    })
})

