
// @ts-check
import sweepit from "eslint-plugin-sweepit"
import reactHooks from "eslint-plugin-react-hooks"
import eslintReact from "@eslint-react/eslint-plugin"
import pluginQuery from "@tanstack/eslint-plugin-query"
import eslintReactRefresh from "eslint-plugin-react-refresh"
import reactRenderTypes from "eslint-plugin-react-render-types"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import {
    type Config,
    defineConfig,
} from "eslint/config"
import youMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect"

import createConfig, { type ConfigOptions } from "./index"

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
            "@eslint-react/dom-no-dangerously-set-innerhtml":            "off",
            "@eslint-react/no-array-index-key":                          "off",
            "@eslint-react/no-context-provider":                         "off",
            "@eslint-react/no-nested-component-definitions":             "off",
            "@eslint-react/set-state-in-effect":                         "off",
            "@eslint-react/use-state":                                   "off",
            "better-tailwindcss/no-unknown-classes":                     "off",
            "custom/no-margin-on-root-jsx":                              "off",
            "custom/prefer-discriminated-union":                         "off",
            "no-restricted-syntax":                                      "off",
            "react-hooks/set-state-in-effect":                           "off",
            "react-hooks/todo":                                          "off",
            "react-you-might-not-need-an-effect/no-event-handler":       "off",
            "react-you-might-not-need-an-effect/no-initialize-state":    "off",
            "react-you-might-not-need-an-effect/no-pass-data-to-parent": "off",
            "sweepit/complexity":                                        "off",
            "sweepit/jsx-bem-compound-naming":                           "off",
            "sweepit/jsx-on-handler-verb-suffix":                        "off",
            "sweepit/no-array-props":                                    "off",
            "sweepit/no-boolean-capability-props":                       "off",
            "sweepit/no-object-props":                                   "off",
            "sweepit/no-prop-drilling":                                  "off",
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
                eslintReactRefresh.configs.recommended,
                reactHooks.configs.flat.recommended,
                eslintReact.configs["recommended-typescript"],
                youMightNotNeedAnEffect.configs.recommended,
                pluginQuery.configs["flat/recommended"],
                // @ts-expect-error Weird types.
                reactRenderTypes.configs.recommended,
                createConfig(rootDir, options),
            ],
            files: ["**/*.{mjs,js,jsx,ts,tsx}"],

            plugins: {
                "better-tailwindcss": betterTailwindcss,
                sweepit,
            },

            rules: {
                "@eslint-react/no-leaked-conditional-rendering": ["error"],
                "react-hooks/todo":                              "error",
                "sweepit/jsx-bem-compound-naming":               "error",
                "sweepit/jsx-compound-part-export-naming":       "off",
                "sweepit/jsx-flat-owner-tree":                   "error",
                // Accept verb-first callbacks such as `onCreateAppointment`.
                "sweepit/jsx-on-handler-verb-suffix":            "off",
                "sweepit/jsx-server-action-prop-suffix":         "error",
                "sweepit/max-custom-props":                      "error",
                "sweepit/no-array-props":                        "error",
                "sweepit/no-boolean-capability-props":           [
                    "error",
                    {
                        ignore:                   ["asChild"],
                        ignoreNativeBooleanProps: true,
                    },
                ],
                "sweepit/no-componenttype-props":     "error",
                "sweepit/no-custom-kebab-case-props": "error",
                "sweepit/no-element-props":           "error",
                "sweepit/no-exported-context-hooks":  "error",
                "sweepit/no-handle-prefix-utils":     "error",
                "sweepit/no-handler-return-type":     "error",
                "sweepit/no-hook-jsx":                "error",
                "sweepit/no-object-props":            [
                    "error",
                    {
                        ignore: ["ref"],
                    },
                ],
                "sweepit/no-optional-props-without-defaults": [
                    "error",
                    {
                        ignore: ["on*", "ref", "render"],
                    },
                ],
                "sweepit/no-prefixed-prop-bundles": "error",
                "sweepit/no-prop-drilling":         [
                    "error",
                    {
                        allowedDepth:      1,
                        ignorePropsSpread: true,
                    },
                ],
                "sweepit/no-render-helper-functions":                  "error",
                "sweepit/no-set-prefix-utils":                         "error",
                "sweepit/no-title-case-props":                         "error",
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
    ])
}
