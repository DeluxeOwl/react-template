import path from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"
import {
    it, expect, describe, onTestFinished,
} from "vitest"
import {
    rmSync, mkdirSync, mkdtempSync, writeFileSync,
} from "node:fs"

const scanBinary = path.resolve(import.meta.dirname, "../../../node_modules/.bin/oxlint")
const presetsDir = path.resolve(import.meta.dirname, "../oxlint")

function fixture(preset: string): string {
    const dir = mkdtempSync(path.join(tmpdir(), "lint-oxlint-"))

    onTestFinished(() => {
        rmSync(dir, { force: true, recursive: true })
    })
    writeFileSync(path.join(dir, ".oxlintrc.json"), JSON.stringify({ extends: [path.join(presetsDir, preset)] }))

    return dir
}

function lint(dir: string, files: Record<string, string>): { output: string, status: null | number } {
    for (const [file, source] of Object.entries(files)) {
        const fullPath = path.join(dir, file)

        mkdirSync(path.dirname(fullPath), { recursive: true })
        writeFileSync(fullPath, source)
    }

    const result = spawnSync(scanBinary, ["--format=json", ...Object.keys(files)], { cwd: dir, encoding: "utf8" })

    return { output: result.stdout + result.stderr, status: result.status }
}

describe("shared oxlint React presets", () => {
    describe("given Node imports in tooling, tests, and browser code", () => {
        describe("when applying the React preset", () => {
            it("then it allows Node only in scripts, config files, and tests", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("react.json")
                const vendorDir = fixture("react-vendored.json")
                const nodeImport = "import { readFileSync } from \"node:fs\"\nexport const content = readFileSync(\"data.json\", \"utf8\")"

                // WHEN
                const tooling = lint(dir, {
                    "scripts/extract.ts":   nodeImport,
                    "src/contract.test.ts": nodeImport,
                    "vite.config.ts":       nodeImport,
                })
                const browser = lint(dir, { "src/read-data.ts": nodeImport })
                const vendoredTooling = lint(vendorDir, { "vite.config.ts": nodeImport })

                // THEN
                expect(tooling.status).toBe(0)
                expect(browser.status).toBe(1)
                expect(browser.output).toContain("no-nodejs-modules")
                expect(vendoredTooling.status).toBe(0)
            })
        })
    })

    describe("given generated components and handwritten features", () => {
        describe("when opting into the vendored preset", () => {
            it("then it relaxes vendored code without allowing dangerous HTML in features", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("react-vendored.json")
                const component = "export function Card() { return <div dangerouslySetInnerHTML={{ __html: \"trusted\" }} /> }"

                // WHEN
                const vendored = lint(dir, { "src/components/ui/card.tsx": component })
                const feature = lint(dir, { "src/features/card.tsx": component })

                // THEN
                expect(vendored.status).toBe(0)
                expect(feature.status).toBe(1)
                expect(feature.output).toContain("no-danger")
            })
        })
    })

    describe("given Phosphor icon imports", () => {
        describe("when applying the React preset", () => {
            it("then it rejects the full-library barrel but accepts a direct icon import", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("react.json")

                // WHEN
                const barrel = lint(dir, { "src/icon.ts": "import { CaretDown } from \"@phosphor-icons/react\"\nexport const Icon = CaretDown" })
                const direct = lint(dir, { "src/icon.ts": "import { CaretDown } from \"@phosphor-icons/react/CaretDown\"\nexport const Icon = CaretDown" })

                // THEN
                expect(barrel.status).toBe(1)
                expect(barrel.output).toContain("no-restricted-imports")
                expect(direct.status).toBe(0)
            })
        })
    })
})
