
// @ts-check

import tseslint from "typescript-eslint"
import vitest from "@vitest/eslint-plugin"
import gitignore from "eslint-config-flat-gitignore"
import {
    type Config,
    defineConfig,
} from "eslint/config"

import { migratedToOxlint, baseRulesHandledByOxlint } from "./handled-by-oxlint.ts"

// bun run eslint --inspect-config

export interface ConfigOptions {
    allowDefaultProject?:  string[]
    // ESLint rules switched off because oxlint runs them. Defaults to the base preset's list.
    rulesHandledByOxlint?: string[]
}

// oxlint-disable-next-line max-lines-per-function -- This factory declares the complete shared ESLint preset.
export default function createConfig(rootDir: string, options?: ConfigOptions): Config[] {
    const allowDefaultProject = options?.allowDefaultProject ?? []
    const rulesHandledByOxlint = options?.rulesHandledByOxlint ?? baseRulesHandledByOxlint

    return defineConfig([
        gitignore(),
        {
            ignores: [
                "dist/**",
                "**/*.gen.ts",
                ".vscode/**",
                ".oxlintrc.json",
                "build/**",
                ".next/**",
                "out/**",
                "coverage/**",
                "app/globals.css",
                "node_modules/**",
                "messages/**",
                "public/**",
            ],
        },
        {
            extends: [
                tseslint.configs.recommendedTypeChecked,
                // NOTE: Needs to be last
                {
                    name:  "deluxeowl/handled-by-oxlint",
                    rules: Object.fromEntries(rulesHandledByOxlint.map((ruleId) => [ruleId, "off"])),
                },
            ],
            files: ["**/*.{mjs,js,jsx,ts,tsx}"],

            languageOptions: {
                parser:        tseslint.parser,
                parserOptions: {
                    projectService: {
                        allowDefaultProject: ["*.d.ts", ...allowDefaultProject],
                    },
                    tsconfigRootDir: rootDir,
                },
            },

            plugins: {
                "@typescript-eslint": tseslint.plugin,
            },

            rules: {
                // For ordering classes and such, conflicts with perfectionist/sort-interfaces
                // Could maybe configure it for classes
                "@typescript-eslint/member-ordering": [
                    "off",
                    { default: ["signature", "method", "constructor", "field"] },
                ],
                // Classes use method, react uses signature
                "@typescript-eslint/method-signature-style":          ["off"],
                // These 2 are handled by oxlint.
                "@typescript-eslint/no-explicit-any":                 ["off"],
                "@typescript-eslint/no-require-imports":              ["off"],
                // Related to restricted types
                "@typescript-eslint/no-restricted-types":             ["off"],
                "@typescript-eslint/no-unused-vars":                  "off",
                // Disabled, too many positives
                "@typescript-eslint/only-throw-error":                "off",
                // This is not bad but really, it will confuse the LLMs
                "@typescript-eslint/prefer-readonly-parameter-types": "off",
                "@typescript-eslint/unified-signatures":              "error",
                // 0 and 1 are common enough during ifs, arrays etc.
                "no-magic-numbers":                                   ["off"],
                "no-restricted-imports":                              "off",
            },
        },
        {
            files:   ["**/*.test.ts", "**/*.test.tsx"],
            plugins: {
                vitest,
            },
            rules: {
                ...vitest.configs.all.rules,
                // One behavior can require more than five assertions, such as a DTO round-trip.
                "vitest/max-expects":        "off",
                "vitest/no-identical-title": "off",
            },
            settings: {
                vitest: {
                    typecheck: true,
                },
            },
        },
        migratedToOxlint(),
    ])
}
