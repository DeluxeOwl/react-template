import path from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"
import {
    rmSync, mkdtempSync, writeFileSync,
} from "node:fs"
import {
    it, expect, describe, onTestFinished,
} from "vitest"

import { addAstGrepSuppressions } from "./ast-grep"

const scanBinary = path.resolve(import.meta.dirname, "../../../node_modules/.bin/ast-grep")
const scanConfig = path.resolve(import.meta.dirname, "../../../sgconfig.yml")

const source = `function Card() {
    const [count, setCount] = useState(0)
    return (
        <ul>
            {items.map((item) => {
                const name = item.name.toUpperCase()
                return <li>{name}</li>
            })}
            <li>{count}</li>
        </ul>
    )
}
`

describe("ast-grep suppression directives", () => {
    describe("given findings in both a component body and JSX expression", () => {
        describe("when adding directives", () => {
            it("then a real scan accepts both placements and a repeated scan needs no changes", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = mkdtempSync(path.join(tmpdir(), "lint-suppression-"))
                const file = path.join(dir, "card.tsx")

                onTestFinished(() => {
                    rmSync(dir, { force: true, recursive: true })
                })
                writeFileSync(file, source)

                const before = spawnSync(scanBinary, ["scan", "--config", scanConfig, "--json=compact", file], { encoding: "utf8" })

                // WHEN
                const annotated = addAstGrepSuppressions(source, [
                    { line: 1, ruleId: "no-builtin-hooks-in-component" },
                    { line: 4, ruleId: "no-logic-in-map-callback" },
                    { line: 4, ruleId: "no-logic-in-map-callback" },
                ])

                writeFileSync(file, annotated as string)
                const after = spawnSync(scanBinary, ["scan", "--config", scanConfig, "--json=compact", file], { encoding: "utf8" })

                // THEN
                expect(before.status).toBe(1)
                expect(before.stdout).toContain("\"ruleId\":\"no-logic-in-map-callback\"")
                expect(after.status).toBe(0)
                expect(after.stdout.trim()).toBe("[]")
                expect(addAstGrepSuppressions(annotated as string, [])).toBe(annotated)
            })
        })
    })

    describe("given a Windows file and multiple rules on one line", () => {
        describe("when adding directives", () => {
            it("then it preserves CRLF and groups duplicate findings into one directive", () => {
                expect.hasAssertions()

                // GIVEN / WHEN
                const annotated = addAstGrepSuppressions("function Card() {\r\n\tconst value = useThing()\r\n}\r\n", [
                    { line: 1, ruleId: "z-rule" },
                    { line: 1, ruleId: "a-rule" },
                    { line: 1, ruleId: "z-rule" },
                ])

                // THEN
                expect(annotated).toBe("function Card() {\r\n\t// ast-grep-ignore: a-rule, z-rule\r\n\tconst value = useThing()\r\n}\r\n")
            })
        })
    })

    describe("given an invalid line or unused directive", () => {
        describe("when attempting annotation", () => {
            it("then it returns an error instead of silently producing incomplete suppressions", () => {
                expect.hasAssertions()

                // GIVEN / WHEN
                const invalidLine = addAstGrepSuppressions(source, [{ line: 999, ruleId: "no-builtin-hooks-in-component" }])
                const unused = addAstGrepSuppressions(source, [{ line: 1, ruleId: "unused-suppression" }])

                // THEN
                expect(invalidLine).toStrictEqual(new Error("Invalid ast-grep start line: 999."))
                expect(unused).toStrictEqual(new Error("Unused ast-grep directives must be removed, not suppressed."))
            })
        })
    })
})
