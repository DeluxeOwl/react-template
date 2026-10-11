/* oxlint-disable vitest-js/require-hook -- RuleTester.run registers its own describe and it blocks */
import { createRuleTester } from "./rule-tester.ts"
import { noBareEnableDirectiveRule } from "./no-bare-enable-directive.ts"

const ruleTester = createRuleTester("ts")

ruleTester.run("no-bare-enable-directive", noBareEnableDirectiveRule, {
    invalid: [
        // The case oxlint gets wrong: the rule disabled by name stays off after the bare enable.
        {
            code:   "/* oxlint-disable no-console */\nconsole.log(1)\n/* oxlint-enable */\nconsole.log(2)",
            errors: [
                {
                    data: { directive: "oxlint-enable" }, line: 3, messageId: "bareEnable",
                },
            ],
        },
        {
            code:   "/* eslint-enable */",
            errors: [{ data: { directive: "eslint-enable" }, messageId: "bareEnable" }],
        },
        // With a reason
        {
            code:   "/* oxlint-enable -- back on */",
            errors: [{ data: { directive: "oxlint-enable" }, messageId: "bareEnable" }],
        },
        // Without spaces
        {
            code:   "/*oxlint-enable*/",
            errors: [{ data: { directive: "oxlint-enable" }, messageId: "bareEnable" }],
        },
        // As a line comment
        {
            code:   "// oxlint-enable",
            errors: [{ data: { directive: "oxlint-enable" }, messageId: "bareEnable" }],
        },
    ],
    valid: [
        "/* oxlint-disable no-console */\nconsole.log(1)\n/* oxlint-enable no-console */",
        "/* eslint-enable no-console, no-debugger -- back on */",
        "// oxlint-disable-next-line no-console\nconsole.log(1)",
        "/* Turn it back on with oxlint-enable. */",
    ],
})
