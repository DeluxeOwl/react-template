import path from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"
import {
    it, expect, describe, onTestFinished,
} from "vitest"
import {
    rmSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync,
} from "node:fs"

import { runOxlintFix } from "./oxlint/index.ts"

const scanBinary = path.resolve(import.meta.dirname, "../../../node_modules/.bin/oxlint")
const presetsModule = path.resolve(import.meta.dirname, "oxlint/index.ts")

// `configExpression` is evaluated inside the fixture's `oxlint.config.ts`, e.g. `createOxlintReactConfig()`.
function fixture(configExpression: string): string {
    const dir = mkdtempSync(path.join(tmpdir(), "lint-oxlint-"))

    onTestFinished(() => {
        rmSync(dir, { force: true, recursive: true })
    })
    writeFileSync(
        path.join(dir, "oxlint.config.ts"),
        `import { createOxlintConfig, defaultVendoredFiles, createOxlintReactConfig } from ${JSON.stringify(presetsModule)}\n\nexport default ${configExpression}\n`,
    )

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
                const dir = fixture("createOxlintReactConfig()")
                const vendorDir = fixture("createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })")
                const nodeImport = "import { readFileSync } from \"node:fs\"\n\nexport const content = readFileSync(\"data.json\", \"utf8\")\n"

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
                const dir = fixture("createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })")
                const component = "export function Card() {\n    return <div dangerouslySetInnerHTML={{ __html: \"trusted\" }} />\n}\n"

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
                const dir = fixture("createOxlintReactConfig()")

                // WHEN
                const barrel = lint(dir, { "src/icon.ts": "import { CaretDown } from \"@phosphor-icons/react\"\n\nexport const icons = [CaretDown]\n" })
                const direct = lint(dir, { "src/icon.ts": "import { CaretDown } from \"@phosphor-icons/react/CaretDown\"\n\nexport const icons = [CaretDown]\n" })

                // THEN
                expect(barrel.status).toBe(1)
                expect(barrel.output).toContain("no-restricted-imports")
                expect(direct.status).toBe(0)
            })
        })
    })

    describe("given formatting that takes two rounds of fixes", () => {
        describe("when fixing with oxlint --fix once, and with runOxlintFix", () => {
            it("then only runOxlintFix reaches the formatted result, like eslint --fix", () => {
                expect.hasAssertions()

                // GIVEN
                // Round 1 aligns the values (key-spacing) and moves `ccc` to a new, unindented line
                // (object-property-newline); round 2 indents it (indent).
                const source = "export const x = {\n    a: 1,\n    bb: 2, ccc: 3,\n}\n"
                const formatted = "export const x = {\n    a:   1,\n    bb:  2,\n    ccc: 3,\n}\n"
                const once = fixture("createOxlintConfig()")
                const looped = fixture("createOxlintConfig()")

                spawnSync("git", ["init", "--quiet"], { cwd: looped })
                writeFileSync(path.join(once, "object.ts"), source)
                writeFileSync(path.join(looped, "object.ts"), source)

                // WHEN
                // `oxlint --fix` reports only what it could not fix in this run, so it exits 0 here.
                const singleFix = spawnSync(scanBinary, ["--fix", "object.ts"], { cwd: once, encoding: "utf8" })
                const afterSingleFix = spawnSync(scanBinary, ["object.ts"], { cwd: once, encoding: "utf8" })
                const status = runOxlintFix(["object.ts"], { cwd: looped })

                // THEN
                expect(singleFix.status).toBe(0)
                expect(afterSingleFix.status).toBe(1)
                expect(afterSingleFix.stdout).toContain("@stylistic(indent)")
                expect(status).toBe(0)
                expect(readFileSync(path.join(looped, "object.ts"), "utf8")).toBe(formatted)
            })
        })
    })
})
