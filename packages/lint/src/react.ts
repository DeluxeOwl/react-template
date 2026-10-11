
// @ts-check
import globals from "globals"
import sweepit from "eslint-plugin-sweepit"
import eslintReact from "@eslint-react/eslint-plugin"
import pluginQuery from "@tanstack/eslint-plugin-query"
import reactRenderTypes from "eslint-plugin-react-render-types"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import {
    type Config,
    defineConfig,
} from "eslint/config"

import createConfig, { type ConfigOptions } from "./index"
import {
    migratedToOxlint, baseRulesHandledByOxlint, reactRulesHandledByOxlint,
} from "./handled-by-oxlint.ts"

export interface ReactConfigOptions extends ConfigOptions {
    vendoredFiles?: string[]
}

function createVendoredConfig(files: string[]): Config {
    return {
        files,
        rules: {
            "sweepit/jsx-on-handler-verb-suffix": "off",
            "sweepit/no-array-props":             "off",
            "sweepit/no-object-props":            "off",
        },
    }
}

export default function createReactConfig(rootDir: string, options?: ReactConfigOptions): Config[] {
    return defineConfig([
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
                eslintReact.configs["recommended-typescript"],
                pluginQuery.configs["flat/recommended"],
                // @ts-expect-error Weird types.
                reactRenderTypes.configs.recommended,
                createConfig(rootDir, {
                    ...options,
                    rulesHandledByOxlint: options?.rulesHandledByOxlint ?? [...baseRulesHandledByOxlint, ...reactRulesHandledByOxlint],
                }),
            ],
            files: ["**/*.{mjs,js,jsx,ts,tsx}"],

            // These files used to get the browser globals and JSX parsing from the preset of
            // react-you-might-not-need-an-effect, whose rules now run in oxlint. Set here so the
            // rules still in ESLint see the same scope as before.
            languageOptions: {
                globals:       globals.browser,
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                },
            },

            plugins: {
                "better-tailwindcss": betterTailwindcss,
                sweepit,
            },

            rules: {
                "@eslint-react/no-leaked-conditional-rendering": ["error"],
                // The other better-tailwindcss rules run in oxlint (./oxlint/better-tailwindcss.ts). This
                // one stays: Tailwind's canonical form of a class depends on the classes compiled before
                // it in the same process, and oxlint lints files in parallel, in a new process each fix
                // round, so its fixes would differ.
                "better-tailwindcss/enforce-canonical-classes":  "warn",
                "sweepit/jsx-compound-part-export-naming":       "off",
                // Accept verb-first callbacks such as `onCreateAppointment`.
                "sweepit/jsx-on-handler-verb-suffix":            "off",
                // The other enabled sweepit rules run in oxlint (./oxlint/sweepit.ts). These two stay
                // here: they use the type checker, which oxlint JS plugins don't get.
                "sweepit/no-array-props":                        "error",
                "sweepit/no-object-props":                       [
                    "error",
                    {
                        ignore: ["ref"],
                    },
                ],
                // View-model hooks can wrap pure logic or call React 19 `use`.
                "sweepit/no-useless-hook": "off",
            },
        },
        // Relax only the selected third-party files. Type-safety and return-type rules stay enabled.
        ...options?.vendoredFiles?.length ? [createVendoredConfig(options.vendoredFiles)] : [],
        migratedToOxlint(),
    ])
}
