import path from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"
import {
    it, vi, expect, describe, onTestFinished,
} from "vitest"
import {
    rmSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync,
} from "node:fs"

import { runOxlintFix } from "./oxlint/index.ts"

const scanBinary = path.resolve(import.meta.dirname, "../../../node_modules/.bin/oxlint")
const presetsModule = path.resolve(import.meta.dirname, "oxlint/index.ts")
// Tailwind and the app's stylesheet resolve from here; a fixture's temp dir has neither.
const webDir = path.resolve(import.meta.dirname, "../../../apps/web")
// `configExpression` is evaluated inside the fixture's `oxlint.config.ts`, e.g. `createOxlintReactConfig()`.
function fixture(configExpression: string): string {
    const dir = mkdtempSync(path.join(tmpdir(), "lint-oxlint-"))

    onTestFinished(() => {
        rmSync(dir, { force: true, recursive: true })
    })
    writeFileSync(
        path.join(dir, "oxlint.config.ts"),
        `import { createOxlintConfig, defaultVendoredFiles, createOxlintRootConfig, createOxlintReactConfig, smoothShadowRestrictions } from ${JSON.stringify(presetsModule)}\n\nexport default ${configExpression}\n`,
    )

    return dir
}

interface LintResult {
    output: string
    stdout: string
    status: null | number
}

function lint(dir: string, files: Record<string, string>): LintResult {
    for (const [file, source] of Object.entries(files)) {
        const fullPath = path.join(dir, file)

        mkdirSync(path.dirname(fullPath), { recursive: true })
        writeFileSync(fullPath, source)
    }

    const result = spawnSync(scanBinary, ["--format=json", ...Object.keys(files)], { cwd: dir, encoding: "utf8" })

    // stderr has plugin warnings, e.g. better-tailwindcss when the fixture has no Tailwind
    return {
        output: result.stdout + result.stderr, status: result.status, stdout: result.stdout,
    }
}

interface JsonDiagnostic {
    code:    string
    message: string
    labels:  { span: { offset: number } }[]
}

// Messages of better-tailwindcss/no-restricted-classes in `oxlint --format=json` output, in source order.
function restrictedClassMessages(stdout: string): string[] {
    const { diagnostics } = JSON.parse(stdout) as { diagnostics: JsonDiagnostic[] }

    return diagnostics
        .filter((diagnostic) => diagnostic.code === "better-tailwindcss(no-restricted-classes)")
        .toSorted((first, second) => first.labels[0].span.offset - second.labels[0].span.offset)
        .map((diagnostic) => diagnostic.message)
}

describe("shared oxlint React presets", () => {
    describe("given Node imports in tooling, tests, and browser code", () => {
        describe("when applying the React preset", () => {
            it("then it allows Node only in scripts, config files, and tests", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintReactConfig()")
                const vendorDir = fixture("createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })")
                // Re-exported, not called: the fixture has no Node types, so a call would be an unsafe `any`.
                const nodeImport = "export { readFileSync } from \"node:fs\"\n"

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
                const component = "export function Card(): React.ReactNode {\n    return <div dangerouslySetInnerHTML={{ __html: \"trusted\" }} />\n}\n"

                // WHEN
                const vendored = lint(dir, { "src/components/ui/card.tsx": component })
                const feature = lint(dir, { "src/features/card.tsx": component })

                // THEN
                expect(vendored.status).toBe(0)
                expect(feature.status).toBe(1)
                expect(feature.output).toContain("no-danger")
            })

            it("then it still requires return types in vendored code", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })")

                // WHEN
                const vendored = lint(dir, { "src/components/ui/card.tsx": "export function Card() {\n    return <div />\n}\n" })

                // THEN
                expect(vendored.status).toBe(1)
                expect(vendored.output).toContain("explicit-function-return-type")
                expect(vendored.output).toContain("custom(require-jsx-return-type)")
            })

            it("then it keeps the type-aware safety rules in vendored code", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })")

                // WHEN
                const vendored = lint(dir, { "src/components/ui/value.ts": "export const value: string = JSON.parse(\"1\")\n" })

                // THEN
                expect(vendored.status).toBe(1)
                expect(vendored.output).toContain("typescript(no-unsafe-assignment)")
            })
        })
    })

    describe("given margin on the root element of a feature and of generated UI code", () => {
        describe("when opting into the vendored preset", () => {
            it("then it reports the margin in the feature only", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })")
                const source = "export function Card(): React.ReactNode {\n    return <div className=\"m-4\" />\n}\n"

                // WHEN
                const { stdout } = lint(dir, { "src/components/ui/card.tsx": source, "src/features/card.tsx": source })

                // THEN
                const { diagnostics } = JSON.parse(stdout) as { diagnostics: { code: string, filename: string }[] }
                const margins = diagnostics.filter((diagnostic) => diagnostic.code === "custom(no-margin-on-root-jsx)")

                expect(margins.map((diagnostic) => diagnostic.filename)).toStrictEqual(["src/features/card.tsx"])
            })
        })
    })

    describe("given a throw statement in a feature and in generated UI code", () => {
        describe("when opting into the vendored preset", () => {
            it("then it bans throw in the feature only", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })")
                const source = "export function fail(): never {\n    throw new Error(\"no\")\n}\n"

                // WHEN
                const { stdout } = lint(dir, { "src/components/ui/fail.ts": source, "src/features/fail.ts": source })

                // THEN
                const { diagnostics } = JSON.parse(stdout) as { diagnostics: { code: string, filename: string }[] }
                const banned = diagnostics.filter((diagnostic) => diagnostic.code === "eslint-js(no-restricted-syntax)")

                expect(banned.map((diagnostic) => diagnostic.filename)).toStrictEqual(["src/features/fail.ts"])
            })
        })
    })

    describe("given a builtin hook in a feature component and in generated UI code", () => {
        describe("when opting into the vendored preset", () => {
            it("then the view-only rules report the feature only", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })")
                const source = "export function Card(): React.ReactNode {\n    const [isOpen] = useState(false)\n    return <div><span>{String(isOpen)}</span></div>\n}\n"

                // WHEN
                const { stdout } = lint(dir, { "src/components/ui/card.tsx": source, "src/features/card.tsx": source })

                // THEN
                const { diagnostics } = JSON.parse(stdout) as { diagnostics: { code: string, filename: string }[] }
                const hooks = diagnostics.filter((diagnostic) => diagnostic.code === "custom(no-builtin-hooks-in-component)")

                expect(hooks.map((diagnostic) => diagnostic.filename)).toStrictEqual(["src/features/card.tsx"])
            })
        })
    })

    describe("given two event listeners added in a useEffect, in a .tsx and a .ts file", () => {
        describe("when applying the React preset", () => {
            it("then it asks for an AbortController in the .tsx file only, as ast-grep did", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintReactConfig()")
                const source = "useEffect(() => {\n    window.addEventListener(\"scroll\", onScroll)\n    window.addEventListener(\"resize\", onResize)\n}, [])\n"

                // WHEN
                const { stdout } = lint(dir, { "src/use-layout.ts": source, "src/use-layout.tsx": source })

                // THEN
                const { diagnostics } = JSON.parse(stdout) as { diagnostics: { code: string, filename: string }[] }
                const listeners = diagnostics.filter((diagnostic) => diagnostic.code === "custom(use-abort-controller-for-multiple-listeners)")

                expect(listeners.map((diagnostic) => diagnostic.filename)).toStrictEqual(["src/use-layout.tsx"])
            })
        })
    })

    describe("given a test without assertions, in test and source files", () => {
        describe("when applying the base and React presets", () => {
            it("then the vitest rules warn in .test.ts and .test.tsx files only", () => {
                expect.hasAssertions()

                // GIVEN
                const base = fixture("createOxlintConfig()")
                const react = fixture("createOxlintReactConfig()")
                const test = "import { it } from \"vitest\"\n\nit(\"works\", () => {})\n"

                // WHEN
                const baseTest = lint(base, { "src/contract.test.ts": test })
                const reactTest = lint(react, { "src/view.test.tsx": test })
                const source = lint(base, { "src/contract.ts": test })

                // THEN
                expect(baseTest.output).toContain("vitest-js(expect-expect)")
                expect(reactTest.output).toContain("vitest-js(expect-expect)")
                expect(source.output).not.toContain("vitest-js")
            })
        })
    })

    describe("given handler maps keyed by names that require quotes", () => {
        describe("when applying the base and React presets", () => {
            it("then it allows quoted arrow handlers, function expressions, and methods", () => {
                expect.hasAssertions()

                // GIVEN
                const base = fixture("createOxlintConfig()")
                const react = fixture("createOxlintReactConfig()")
                const source = `export const handlers = {
    "account/closed": function (closed: string): string { return closed },
    "account/opened": async (opened: string): Promise<string> => Promise.resolve(opened),
    "account/suspended"(suspended: string): string { return suspended },
}
`

                // WHEN
                const baseResult = lint(base, { "src/handlers.ts": source })
                const reactResult = lint(react, { "src/handlers.ts": source })

                // THEN
                const { diagnostics: baseDiagnostics } = JSON.parse(baseResult.stdout) as { diagnostics: JsonDiagnostic[] }
                const { diagnostics: reactDiagnostics } = JSON.parse(reactResult.stdout) as { diagnostics: JsonDiagnostic[] }

                expect(baseDiagnostics.filter((diagnostic) => diagnostic.code === "typescript-eslint-js(naming-convention)")).toStrictEqual([])
                expect(reactDiagnostics.filter((diagnostic) => diagnostic.code === "typescript-eslint-js(naming-convention)")).toStrictEqual([])
            })

            it("then it still checks ordinary method names and quoted handlers' parameters", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintConfig()")
                const source = `export const handlers = {
    "account/opened": (Opened: string): string => Opened,
    account_closed: (): void => {},
    "account_suspended"(): void {},
}
`

                // WHEN
                const { stdout } = lint(dir, { "src/handlers.ts": source })

                // THEN
                const { diagnostics } = JSON.parse(stdout) as { diagnostics: JsonDiagnostic[] }
                const messages = diagnostics
                    .filter((diagnostic) => diagnostic.code === "typescript-eslint-js(naming-convention)")
                    .map((diagnostic) => diagnostic.message)

                expect(messages).toHaveLength(3)
                expect(messages).toStrictEqual(expect.arrayContaining([
                    expect.stringContaining("Opened"),
                    expect.stringContaining("account_closed"),
                    expect.stringContaining("account_suspended"),
                ]))
            })
        })
    })

    describe("given prefix- and suffix-named CQRS handlers", () => {
        describe("when applying the base preset", () => {
            it("then it infers handler errors without relaxing other exported functions", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = fixture("createOxlintConfig()")
                const handler = "export function handle() {\n    return 1\n}\n"

                // WHEN
                const handlers = lint(dir, {
                    "src/todos/command-create-todo.ts": handler,
                    "src/todos/create-todo.command.ts": handler,
                    "src/todos/list-todos.query.ts":    handler,
                })
                const source = lint(dir, { "src/todos/create-todo.ts": handler })

                // THEN
                expect(handlers.output).not.toContain("explicit-function-return-type")
                expect(source.output).toContain("explicit-function-return-type")
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
                // The fixture has no node_modules: import-x/no-unresolved reports both imports, so check
                // only the restriction.
                expect(direct.output).not.toContain("no-restricted-imports")
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

    describe("given two rules that undo each other's fixes in four rounds", () => {
        describe("when fixing with runOxlintFix", () => {
            it("then it stops at the first text the file already had, and warns", () => {
                expect.hasAssertions()

                // GIVEN
                // Line wrapping (better-tailwindcss) makes the long class string a multi-line
                // template; key-spacing drops the alignment of the multi-line value; the string
                // now fits, so line wrapping makes it one line again; key-spacing aligns it, and
                // it is too long again. A check for two-round cycles (eslint --fix) misses this.
                const classes = "ps-4 pe-4 ms-4 me-4 border-s-2 border-e-2 rounded-s-md rounded-e-md start-0 end-0 text-start text-end gap-4"
                const source = `declare function tv(config: object): string\n\nexport const result = tv({ base: "${classes}", variants: { size: { normal: "${classes}" } } })\n`
                const repeated = "declare function tv(config: object): string\n\nexport const result = tv({\n    base:     `\n      start-0 end-0 ms-4 me-4 gap-4 rounded-s-md rounded-e-md border-s-2 border-e-2 ps-4 pe-4 text-end text-start\n    `,\n    variants: {\n        size: {\n            normal: `\n              start-0 end-0 ms-4 me-4 gap-4 rounded-s-md rounded-e-md border-s-2 border-e-2 ps-4 pe-4 text-end\n              text-start\n            `,\n        },\n    },\n})\n"
                const dir = fixture(`createOxlintReactConfig({ tailwindSettings: { cwd: ${JSON.stringify(webDir)}, entryPoint: "index.css" } })`)
                const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true)

                onTestFinished(() => {
                    stderr.mockRestore()
                })
                spawnSync("git", ["init", "--quiet"], { cwd: dir })
                mkdirSync(path.join(dir, "src"))
                writeFileSync(path.join(dir, "src/result.tsx"), source)

                // WHEN
                const status = runOxlintFix(["src/result.tsx"], { cwd: dir })

                // THEN
                expect(status).toBe(1)
                expect(readFileSync(path.join(dir, "src/result.tsx"), "utf8")).toBe(repeated)
                expect(stderr).toHaveBeenCalledWith(expect.stringContaining("Circular fixes detected"))
            })
        })
    })

    describe("given React projects with and without shadow-plugin", () => {
        describe("when adding smooth-shadow restrictions", () => {
            it("then it keeps the color and RTL restrictions and restricts shadows only when opted in", () => {
                expect.hasAssertions()

                // GIVEN
                const tailwindSettings = `tailwindSettings: { cwd: ${JSON.stringify(webDir)}, entryPoint: "index.css" }`
                const defaults = fixture(`createOxlintReactConfig({ ${tailwindSettings} })`)
                const optedIn = fixture(`createOxlintReactConfig({ additionalTailwindRestrictions: smoothShadowRestrictions, ${tailwindSettings} })`)
                const view = { "src/view.tsx": "export const view = <div className=\"text-red-500 pl-4 shadow-lg hover:shadow-2xs shadow-red-500\" />\n" }

                spawnSync("git", ["init", "--quiet"], { cwd: optedIn })

                // WHEN
                const defaultMessages = restrictedClassMessages(lint(defaults, view).stdout)
                const optedInMessages = restrictedClassMessages(lint(optedIn, view).stdout)
                runOxlintFix(["src/view.tsx"], { cwd: optedIn })
                const fixed = readFileSync(path.join(optedIn, "src/view.tsx"), "utf8")

                // THEN
                expect(defaultMessages).toStrictEqual([
                    "Restricted hardcoded color. Define a css variable instead.",
                    "Use logical 'start' (-s) instead of 'left' (-l) for RTL support.",
                ])
                expect(optedInMessages).toStrictEqual([
                    "Restricted hardcoded color. Define a css variable instead.",
                    "Use logical 'start' (-s) instead of 'left' (-l) for RTL support.",
                    "Use the smooth-shadow scale (smooth-shadow-ring-* on elevated surfaces) instead of Tailwind's default shadows.",
                    "No smooth-shadow-2xs exists. Use 'smooth-shadow-xs' or no shadow at all.",
                ])
                expect(fixed).toContain("smooth-shadow-lg")
                expect(fixed).toContain("hover:shadow-2xs")
            })
        })
    })
})

// A monorepo in a temp dir: the root config, and below it `workspace/` with a config built by
// `workspaceConfig` and a tsconfig.json for the type-aware rules. `lint` runs from the root, as VS Code does.
function monorepoFixture(workspaceConfig: string): string {
    const dir = fixture("createOxlintRootConfig()")

    mkdirSync(path.join(dir, "workspace"))
    writeFileSync(
        path.join(dir, "workspace/oxlint.config.ts"),
        `import { createOxlintConfig } from ${JSON.stringify(presetsModule)}\n\nexport default ${workspaceConfig}\n`,
    )
    writeFileSync(path.join(dir, "workspace/tsconfig.json"), JSON.stringify({ compilerOptions: { lib: ["esnext"], strict: true } }))

    return dir
}

// A floating promise (a type-aware rule) and a 2-space indent (a JS-plugin rule).
const workspaceSource = "export function load(): void {\n  Promise.resolve(1)\n}\n"

describe("shared oxlint presets in a monorepo", () => {
    describe("given a root config from createOxlintRootConfig and a workspace config below it", () => {
        describe("when the workspace config is built with nested: true", () => {
            it("then a run from the root applies the workspace's rules, type-aware ones included", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = monorepoFixture("createOxlintConfig({ nested: true })")

                // WHEN
                const result = lint(dir, { "workspace/load.ts": workspaceSource })

                // THEN
                expect(result.output).toContain("typescript(no-floating-promises)")
                expect(result.output).toContain("@stylistic(indent)")
            })
        })

        describe("when the workspace config keeps the root-only options", () => {
            it("then oxlint refuses to load it", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = monorepoFixture("createOxlintConfig()")

                // WHEN
                const result = lint(dir, { "workspace/load.ts": workspaceSource })

                // THEN
                expect(result.output).toContain("The `options.typeAware` option is only supported in the root config")
            })
        })

        describe("when the root also has a node_modules folder, and no git repo hides it", () => {
            it("then a run from the root lints the workspace but skips node_modules, as the presets do", () => {
                expect.hasAssertions()

                // GIVEN
                const dir = monorepoFixture("createOxlintConfig({ nested: true })")

                mkdirSync(path.join(dir, "node_modules/pkg"), { recursive: true })
                writeFileSync(path.join(dir, "node_modules/pkg/index.js"), "debugger\n")
                writeFileSync(path.join(dir, "workspace/load.ts"), workspaceSource)

                // WHEN
                const result = spawnSync(scanBinary, ["--format=json", "."], { cwd: dir, encoding: "utf8" })

                // THEN
                expect(result.stdout).toContain("workspace/load.ts")
                expect(result.stdout).not.toContain("node_modules/pkg")
            })
        })
    })
})
