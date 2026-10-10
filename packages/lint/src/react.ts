
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

export interface TailwindRestriction {
    fix?:     string
    message?: string
    pattern:  string
}

export interface ReactConfigOptions extends ConfigOptions {
    vendoredFiles?:                  string[]
    additionalTailwindRestrictions?: TailwindRestriction[]
}

// Opt in only when the stylesheet imports `shadow-plugin`. Color utilities remain valid.
export const smoothShadowRestrictions: TailwindRestriction[] = [
    {
        fix:     "$1smooth-shadow$2",
        message: "Use the smooth-shadow scale (smooth-shadow-ring-* on elevated surfaces) instead of Tailwind's default shadows.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?shadow(-(?:xs|sm|md|lg|xl|2xl|none))?$",
    },
    {
        message: "No smooth-shadow-2xs exists. Use 'smooth-shadow-xs' or no shadow at all.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?shadow-2xs$",
    },
]

function createVendoredConfig(files: string[]): Config {
    return {
        files,
        rules: {
            "better-tailwindcss/no-unknown-classes": "off",
            "sweepit/jsx-on-handler-verb-suffix":    "off",
            "sweepit/no-array-props":                "off",
            "sweepit/no-object-props":               "off",
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
                "sweepit/no-useless-hook":                             "off",
                ...betterTailwindcss.configs["stylistic-warn"].rules,
                ...betterTailwindcss.configs["correctness-error"].rules,
                "better-tailwindcss/enforce-consistent-line-wrapping": [
                    "error", {
                        group:      "newLine",
                        printWidth: 120,
                    },
                ],
                "better-tailwindcss/no-restricted-classes": [
                    // See https://github.com/schoero/eslint-plugin-better-tailwindcss/issues/267
                    "warn", {
                        restrict: [
                            {
                                message: "Restricted hardcoded color. Define a css variable instead.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?(text|bg)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-([0-9])*(\\/[0-9]{1,3})?$",
                            },
                            // 1. Spacing (Padding/Margin) & Border/Rounded Left -> Start
                            {
                                fix:     "$1$2s$3",
                                message: "Use logical 'start' (-s) instead of 'left' (-l) for RTL support.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?(p|m|border-|rounded-)l([-|\\d|px|\\[].*)$",
                            },
                            // 2. Spacing (Padding/Margin) & Border/Rounded Right -> End
                            {
                                fix:     "$1$2e$3",
                                message: "Use logical 'end' (-e) instead of 'right' (-r) for RTL support.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?(p|m|border-|rounded-)r([-|\\d|px|\\[].*)$",
                            },
                            // 3. Inset Left -> Start
                            {
                                fix:     "$1start$2",
                                message: "Use 'start' instead of 'left' for RTL support.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?left([-|\\d|px|\\[].*)$",
                            },
                            // 4. Inset Right -> End
                            {
                                fix:     "$1end$2",
                                message: "Use 'end' instead of 'right' for RTL support.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?right([-|\\d|px|\\[].*)$",
                            },
                            // 5. Text Align Left -> Start
                            {
                                fix:     "$1text-start",
                                message: "Use 'text-start' instead of 'text-left'.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?text-left$",
                            },
                            // 6. Text Align Right -> End
                            {
                                fix:     "$1text-end",
                                message: "Use 'text-end' instead of 'text-right'.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?text-right$",
                            },
                            // 7. Space utilities cause layout issues. Use gap utilities instead.
                            {
                                message: "Use flex and 'gap' instead of 'space-' utilities.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?space-",
                            },
                            // 8. Divide utilities can cause layout issues. Use gap with borders instead.
                            {
                                message: "Use 'gap' with border styling instead of 'divide-' utilities.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?divide-",
                            },
                            // 9. Float utilities are outdated. Use flexbox or grid instead.
                            {
                                message: "Use flexbox or grid instead of 'float-' utilities.",
                                pattern: "^([a-zA-Z0-9:/_-]*:)?float-",
                            },
                            // Rule options replace arrays in ESLint. Append here to retain shared restrictions.
                            ...options?.additionalTailwindRestrictions ?? [],
                        ],
                    },
                ],
            },
        },
        // Relax only the selected third-party files. Type-safety and return-type rules stay enabled.
        ...options?.vendoredFiles?.length ? [createVendoredConfig(options.vendoredFiles)] : [],
        migratedToOxlint(),
    ])
}
