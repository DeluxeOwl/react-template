/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-check
import tseslint from "typescript-eslint"
import {
    defineConfig,
} from "eslint/config"
import reactHooks from "eslint-plugin-react-hooks"
import eslintReact from "@eslint-react/eslint-plugin"
import eslintPluginReadableTailwind from "eslint-plugin-readable-tailwind"
import youMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect"
import createConfig from '@react-template/eslint'

// Depends on the default config
export default function createReactConfig(rootDir: string) {
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
                reactHooks.configs.flat.recommended,
                eslintReact.configs["recommended-typescript"],
                youMightNotNeedAnEffect.configs.recommended,
                createConfig(rootDir),
            ],
            files: ["**/*.{mjs,js,jsx,ts,tsx}"],

            languageOptions: {
                parser:        tseslint.parser,
                parserOptions: {
                    projectService: {
                        // Extra files for the linting
                        allowDefaultProject: ["*eslint.config.ts", "*.d.ts", "*.ts"],
                        tsconfigRootDir: rootDir,
                    },
                },
            },

            plugins: {
                "readable-tailwind":  eslintPluginReadableTailwind,
            },

            rules: {
                "@eslint-react/no-leaked-conditional-rendering": ["error"],
                "react-hooks/todo":                      "error",
                ...eslintPluginReadableTailwind.configs.warning.rules,
                ...eslintPluginReadableTailwind.configs.error.rules,
                "readable-tailwind/multiline": ["off"],
            },
        },
    ])
}