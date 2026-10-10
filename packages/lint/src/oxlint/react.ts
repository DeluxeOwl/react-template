import type { OxlintConfig } from "oxlint"

// React additions on top of the TypeScript preset.
// Ported 1:1 from the former `packages/lint/oxlint/react.json` (oxlint 1.62).
export const reactConfig = {
    overrides: [
        {
            files: [
                "**/scripts/**",
                "**/*.config.{js,mjs,cjs,ts,mts,cts}",
                "**/*.test.ts",
                "**/*.test.tsx",
            ],
            rules: {
                "import/no-nodejs-modules": "off",
            },
        },
    ],
    plugins: [
        "react",
        "jsx-a11y",
    ],
    rules: {
        "eslint/no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        message: "Import the icon directly, for example '@phosphor-icons/react/CaretDown'. The barrel forces the bundler to transform the full icon library.",
                        name:    "@phosphor-icons/react",
                    },
                ],
            },
        ],
        "import/no-nodejs-modules":       "error",
        "jsx-a11y/anchor-ambiguous-text": "warn",
        "react/button-has-type":          "warn",
        "react/jsx-filename-extension":   [
            "error",
            {
                extensions: [".tsx"],
            },
        ],
        "react/jsx-handler-names": "off",
        "react/jsx-max-depth":     [
            "error",
            {
                max: 6,
            },
        ],
        "react/jsx-no-undef":        "off",
        "react/no-danger":           "error",
        "react/no-unknown-property": "error",
        "react/react-in-jsx-scope":  "allow",
    },
    settings: {
        // ESLint ran the rules that moved here with the browser globals on these files. oxlint's own
        // `globals` would also reach its native rules (no-redeclare would flag every `name`), so only
        // our JS-plugin rules get them: see vendor/_compat/globals.js.
        "@deluxeowl/lint": {
            globals: "browser",
        },
        // The JSON preset also set `polymorphicPropName: null`, which is oxlint's default.
        "jsx-a11y": {
            components: {},
        },
        "react": {
            formComponents: [],
            linkComponents: [],
        },
    },
} satisfies OxlintConfig
