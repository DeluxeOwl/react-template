
// @ts-check
import tseslint from "typescript-eslint"
import createConfig from "@react-template/eslint"
import reactHooks from "eslint-plugin-react-hooks"
import eslintReact from "@eslint-react/eslint-plugin"
import reactRefresh from "eslint-plugin-react-refresh"
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
                "@eslint-react/no-leaked-conditional-rendering": ["error"],
                "no-restricted-syntax":                          [
                    "error",
                    {
                        message:  "Generic handler names (like 'handleClick' or 'onDelete') are forbidden. Please be specific about WHAT is being handled, e.g., 'handleUserDelete' or 'onEmailSubmit'.",
                        // This selector looks for variable names and function names
                        selector: "VariableDeclarator > Identifier[name=/^(handleClick|onClick|handleSubmit|onSubmit|handleEvent|onEvent|handleChange|onChange|handleDelete|onDelete|handleSelect|onSelect)$/], FunctionDeclaration > Identifier[name=/^(handleClick|onClick|handleSubmit|onSubmit|handleEvent|onEvent|handleChange|onChange|handleDelete|onDelete|handleSelect|onSelect)$/]",
                    },
                ],
                "react-hooks/todo":                                    "error",
                ...betterTailwindcss.configs["stylistic-warn"].rules,
                ...betterTailwindcss.configs["correctness-error"].rules,
                "better-tailwindcss/enforce-consistent-line-wrapping": ["error", { group: "newLine", printWidth: 120 }],
            },
        },

    ])
}
