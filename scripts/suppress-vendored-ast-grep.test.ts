import path from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"
import {
    it, expect, describe, onTestFinished,
} from "vitest"
import {
    rmSync, mkdirSync, mkdtempSync, symlinkSync, readFileSync, writeFileSync,
} from "node:fs"

const script = path.join(import.meta.dirname, "suppress-vendored-ast-grep.ts")
const nodeModules = path.resolve(import.meta.dirname, "../node_modules")
const rules = path.join(nodeModules, "@deluxeowl/lint/ast-grep/rules")
const target = "src/components/ui"
const component = `function Card() {
    const [count, setCount] = useState(0)
    return <div><span>{count}</span></div>
}
`

function project(): { dir: string, file: string } {
    const dir = mkdtempSync(path.join(tmpdir(), "vendored-suppression-"))
    const file = path.join(dir, target, "card.tsx")

    onTestFinished(() => {
        rmSync(dir, { force: true, recursive: true })
    })
    symlinkSync(nodeModules, path.join(dir, "node_modules"), "dir")
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, component)
    writeFileSync(path.join(dir, "sgconfig.yml"), `ruleDirs:
  - ${rules}
`)

    return { dir, file }
}

function run(dir: string, isCheck = false): { output: string, status: null | number } {
    const result = spawnSync(process.execPath, [script, target, ...isCheck ? ["--check"] : []], { cwd: dir, encoding: "utf8" })

    return { output: result.stdout + result.stderr, status: result.status }
}

describe("vendored ast-grep suppression command", () => {
    describe("given a generated component with structural violations", () => {
        describe("when checking and then suppressing its violations", () => {
            it("then check mode writes nothing and annotation clears the reported violations", () => {
                expect.hasAssertions()

                // GIVEN
                const { dir, file } = project()

                // WHEN
                const before = run(dir, true)
                const unchanged = readFileSync(file, "utf8")
                const suppressed = run(dir)
                const after = run(dir, true)

                // THEN
                expect(before.status).toBe(1)
                expect(unchanged).toBe(component)
                expect(suppressed.status).toBe(0)
                expect(after.status).toBe(0)
                expect(readFileSync(file, "utf8")).toContain("// ast-grep-ignore: no-builtin-hooks-in-component")
            })
        })
    })

    describe("given a stale directive", () => {
        describe("when checking vendored files", () => {
            it("then it rejects the stale directive instead of reporting complete suppression", () => {
                expect.hasAssertions()

                // GIVEN
                const { dir, file } = project()

                writeFileSync(file, "// ast-grep-ignore: no-builtin-hooks-in-component\nexport const value = 1\n")

                // WHEN
                const result = run(dir, true)

                // THEN
                expect(result.status).toBe(1)
                expect(result.output).toContain("remove the unused ast-grep-ignore directive")
            })
        })
    })

    describe("given a broken scanner configuration", () => {
        describe("when running annotation", () => {
            it("then it fails without changing the component", () => {
                expect.hasAssertions()

                // GIVEN
                const { dir, file } = project()

                writeFileSync(path.join(dir, "sgconfig.yml"), "ruleDirs: not-an-array\n")

                // WHEN
                const result = run(dir)

                // THEN
                expect(result.status).toBe(1)
                expect(readFileSync(file, "utf8")).toBe(component)
            })
        })
    })
})
