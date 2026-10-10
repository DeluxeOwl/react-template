import path from "node:path"
import { ESLint, Linter } from "eslint"
import tseslint from "typescript-eslint"
import {
    it, expect, describe,
} from "vitest"

import createReactConfig, { type ReactConfigOptions, smoothShadowRestrictions } from "./react"

const rootDir = path.resolve(import.meta.dirname, "../../../apps/web")

async function configFor(file: string, options?: ReactConfigOptions): Promise<Linter.Config> {
    const eslint = new ESLint({
        cwd:                rootDir,
        overrideConfig:     createReactConfig(rootDir, options),
        overrideConfigFile: true,
    })

    return await eslint.calculateConfigForFile(path.join(rootDir, file)) as Linter.Config
}

function severity(config: Linter.Config, ruleId: string): unknown {
    const rule = config.rules?.[ruleId]

    return Array.isArray(rule) ? rule[0] : rule
}

async function lintRestrictions(options?: ReactConfigOptions): Promise<Linter.LintMessage[]> {
    const config = await configFor("app.tsx", options)
    const linter = new Linter({ cwd: rootDir })

    return linter.verify(
        "const view = <div className=\"text-red-500 pl-4 shadow-lg hover:shadow-2xs shadow-red-500\" />",
        {
            files:           ["**/*.tsx"],
            languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
            plugins:         config.plugins,
            rules:           { "better-tailwindcss/no-restricted-classes": config.rules?.["better-tailwindcss/no-restricted-classes"] },
        },
        { filename: path.join(rootDir, "view.tsx") },
    )
}

describe("shared lint configuration", () => {
    describe("given view-model hooks and verb-first callbacks", () => {
        describe("when applying the shared defaults", () => {
            it("then it does not require stateful hooks or verb-last callbacks", async () => {
                expect.hasAssertions()

                // GIVEN / WHEN
                const config = await configFor("app.tsx")

                // THEN
                expect(severity(config, "sweepit/no-useless-hook")).toBe(0)
                expect(severity(config, "sweepit/jsx-on-handler-verb-suffix")).toBe(0)
            })
        })
    })

    describe("given React projects with and without shadow-plugin", () => {
        describe("when adding smooth-shadow restrictions", () => {
            it("then it preserves color and RTL restrictions without restricting shadows by default", async () => {
                expect.hasAssertions()

                // GIVEN / WHEN
                const defaults = await lintRestrictions()
                const optedIn = await lintRestrictions({ additionalTailwindRestrictions: smoothShadowRestrictions })

                // THEN
                expect(defaults.map((message) => message.message)).toStrictEqual([
                    "Restricted hardcoded color. Define a css variable instead.",
                    "Use logical 'start' (-s) instead of 'left' (-l) for RTL support.",
                ])
                expect(optedIn.map((message) => message.message)).toStrictEqual([
                    "Restricted hardcoded color. Define a css variable instead.",
                    "Use logical 'start' (-s) instead of 'left' (-l) for RTL support.",
                    "Use the smooth-shadow scale (smooth-shadow-ring-* on elevated surfaces) instead of Tailwind's default shadows.",
                    "No smooth-shadow-2xs exists. Use 'smooth-shadow-xs' or no shadow at all.",
                ])
                expect(optedIn[2]?.fix?.text).toContain("smooth-shadow-lg")
                expect(optedIn[3]?.fix).toBeUndefined()
            })
        })
    })

    describe("given explicitly selected vendored files", () => {
        describe("when calculating the effective config", () => {
            it("then it relaxes only vendor policy while retaining type safety", async () => {
                expect.hasAssertions()

                // GIVEN / WHEN
                const options = { vendoredFiles: ["ui/components/ui/**"] }
                const vendored = await configFor("ui/components/ui/card.tsx", options)
                const handwritten = await configFor("app.tsx", options)
                const strictVendor = await configFor("ui/components/ui/card.tsx")

                // THEN
                expect(severity(vendored, "sweepit/no-object-props")).toBe(0)
                expect(severity(handwritten, "sweepit/no-object-props")).toBe(2)
                expect(severity(strictVendor, "sweepit/no-object-props")).toBe(2)
                expect(severity(vendored, "@typescript-eslint/no-unsafe-assignment")).toBe(2)
            })
        })
    })

    describe("given TypeScript and TSX tests", () => {
        describe("when applying the test preset", () => {
            it("then it allows full DTO assertions and retains the other test rules for both extensions", async () => {
                expect.hasAssertions()

                // GIVEN / WHEN
                const ts = await configFor("contract.test.ts")
                const tsx = await configFor("view.test.tsx")
                const source = await configFor("app.tsx")

                // THEN
                expect(severity(ts, "vitest/max-expects")).toBe(0)
                expect(severity(tsx, "vitest/max-expects")).toBe(0)
                // most vitest rules run in oxlint (oxlint.test.ts); valid-title stays (type checker)
                expect(severity(ts, "vitest/valid-title")).toBe(1)
                expect(severity(tsx, "vitest/valid-title")).toBe(1)
                expect(severity(source, "vitest/valid-title")).toBeUndefined()
            })
        })
    })

    describe("given a React project with tooling outside its tsconfig", () => {
        describe("when forwarding base config options", () => {
            it("then it retains the requested project-service allowance", async () => {
                expect.hasAssertions()

                // GIVEN / WHEN
                const config = await configFor("eslint.config.ts", { allowDefaultProject: ["eslint.config.ts"] })

                // THEN
                expect(config.languageOptions?.parserOptions).toMatchObject({
                    projectService: { allowDefaultProject: ["*.d.ts", "eslint.config.ts"] },
                })
            })
        })
    })
})
