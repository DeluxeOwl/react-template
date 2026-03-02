
// @ts-check
import tseslint from "typescript-eslint"
import createConfig from "@react-template/eslint"
import reactHooks from "eslint-plugin-react-hooks"
import eslintReact from "@eslint-react/eslint-plugin"
import reactRefresh from "eslint-plugin-react-refresh"
import reactRenderTypes from "eslint-plugin-react-render-types"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import {
    type Config,
    defineConfig,
} from "eslint/config"
import youMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect"

// Depends on the default config
export default function createReactConfig(rootDir: string): Config[] {
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
                reactRefresh.configs.recommended,
                reactHooks.configs.flat.recommended,
                eslintReact.configs["recommended-typescript"],
                youMightNotNeedAnEffect.configs.recommended,
                // @ts-expect-error Weird types.
                reactRenderTypes.configs.recommended,
                createConfig(rootDir),
            ],
            files:           ["**/*.{mjs,js,jsx,ts,tsx}"],
            languageOptions: {
                parser:        tseslint.parser,
                parserOptions: {
                    projectService: {
                        // Extra files for the linting
                        allowDefaultProject: ["*.d.ts"],
                        tsconfigRootDir:     rootDir,
                    },
                },
            },

            plugins: {
                "better-tailwindcss": betterTailwindcss,
            },

            rules: {
                "@eslint-react/no-leaked-conditional-rendering":       ["error"],
                "react-hooks/todo":                                    "error",
                ...betterTailwindcss.configs["stylistic-warn"].rules,
                ...betterTailwindcss.configs["correctness-error"].rules,
                "better-tailwindcss/enforce-consistent-line-wrapping": ["error", { group: "newLine", printWidth: 120 }],
                "better-tailwindcss/no-restricted-classes":            [
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
                        ],
                    },
                ],
            },
        },

    ])
}
