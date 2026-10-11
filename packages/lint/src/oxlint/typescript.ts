import type { OxlintConfig } from "oxlint"

// Base preset shared by every TypeScript workspace.
// Ported 1:1 from the former `packages/lint/oxlint/typescript.json` (oxlint 1.62). Entries whose
// comment mentions D-004 were added when upgrading to oxlint 1.86; see `docs/oxlint-migration.md`.
export const typescriptConfig = {
    categories: {
        correctness: "error",
        pedantic:    "error",
        perf:        "warn",
        style:       "error",
        suspicious:  "error",
    },
    env: {
        builtin: true,
    },
    globals:        {},
    ignorePatterns: [
        "dist/**",
        "**/*.gen.ts",
        ".react-router/**",
        ".vscode/**",
        ".oxlintrc.json",
        "locales/**",
        "build/**",
        "out/**",
        "coverage/**",
        "app/globals.css",
        "node_modules/**",
        "public/**",
        "**/*.d.ts",
    ],
    overrides: [
        {
            files: [
                "*.test.ts",
                "*.test.tsx",
            ],
            rules: {
                "eslint/max-nested-callbacks": "off",
                "eslint/max-statements":       "off",
            },
        },
    ],
    plugins: [
        "unicorn",
        "typescript",
        "oxc",
        "import",
    ],
    rules: {
        "eslint/arrow-body-style":     "off",
        "eslint/capitalized-comments": "off",
        "eslint/func-style":           "allow",
        "eslint/id-length":            "off",
        "eslint/init-declarations":    "allow",
        "eslint/max-classes-per-file": "off",
        // The JSON preset used the shorthand `["error", 4]`; the object form avoids a magic number.
        "eslint/max-depth":            [
            "error",
            {
                max: 4,
            },
        ],
        "eslint/max-lines":              ["off"],
        "eslint/max-lines-per-function": [
            "error",
            {
                IIFEs:          false,
                max:            400,
                skipBlankLines: true,
                skipComments:   true,
            },
        ],
        "eslint/max-nested-callbacks": [
            "error",
            {
                max: 5,
            },
        ],
        "eslint/max-params": [
            "error",
            {
                max: 2,
            },
        ],
        "eslint/max-statements": [
            "error",
            {
                max: 15,
            },
        ],
        "eslint/new-cap":               "off",
        "eslint/no-await-in-loop":      ["off"],
        "eslint/no-console":            "off",
        "eslint/no-continue":           ["off"],
        "eslint/no-empty":              "error",
        "eslint/no-empty-function":     "error",
        "eslint/no-eq-null":            "error",
        "eslint/no-inline-comments":    "off",
        "eslint/no-lonely-if":          "off",
        "eslint/no-magic-numbers":      "allow",
        "eslint/no-negated-condition":  "off",
        "eslint/no-regex-spaces":       "error",
        "eslint/no-ternary":            "allow",
        "eslint/no-undefined":          "off",
        "eslint/no-unused-expressions": "error",
        // oxlint 1.86 stopped ignoring a bare `_` parameter by default (D-004). Restore the previous
        // behavior with the same options as `unused-imports/no-unused-vars` (unused-imports.ts).
        "eslint/no-unused-vars":        [
            "error",
            {
                args:              "after-used",
                argsIgnorePattern: "^_",
                vars:              "all",
                varsIgnorePattern: "^_",
            },
        ],
        "eslint/no-warning-comments":                         "off",
        // New in oxlint 1.86, `style`: would merge consecutive declarations; we declare one per statement.
        "eslint/one-var":                                     "off",
        "eslint/prefer-destructuring":                        "allow",
        "eslint/prefer-named-capture-group":                  "error",
        // `typescript/require-await` replaces it: that one accepts an async function that returns a
        // promise, which `typescript/promise-function-async` asks for.
        "eslint/require-await":                               "off",
        "eslint/require-unicode-regexp":                      "error",
        "eslint/sort-imports":                                "allow",
        "eslint/sort-keys":                                   "allow",
        "eslint/unicode-bom":                                 "error",
        "eslint/yoda":                                        "allow",
        "import/consistent-type-specifier-style":             "off",
        "import/exports-last":                                "allow",
        "import/group-exports":                               "off",
        "import/max-dependencies":                            "off",
        "import/no-anonymous-default-export":                 "allow",
        "import/no-commonjs":                                 "error",
        "import/no-cycle":                                    "deny",
        "import/no-named-export":                             "off",
        "import/no-namespace":                                "allow",
        "import/no-nodejs-modules":                           "off",
        "import/no-unassigned-import":                        "allow",
        "import/prefer-default-export":                       "off",
        "oxc/bad-bitwise-operator":                           "error",
        "oxc/no-const-enum":                                  "error",
        "oxc/no-map-spread":                                  ["off"],
        "promise/catch-or-return":                            "error",
        "typescript/consistent-indexed-object-style":         "off",
        // Important, handled by eslint
        "typescript/consistent-type-imports":                 ["error", { fixStyle: "inline-type-imports" }],
        "typescript/method-signature-style":                  "error",
        "typescript/no-dynamic-delete":                       "warn",
        "typescript/no-empty-object-type":                    "error",
        "typescript/no-explicit-any":                         "warn",
        "typescript/no-import-type-side-effects":             "error",
        "typescript/no-inferrable-types":                     "off",
        "typescript/no-namespace":                            "error",
        "typescript/no-non-null-asserted-nullish-coalescing": "error",
        "typescript/no-non-null-assertion":                   "warn",
        "typescript/no-require-imports":                      "error",
        "typescript/parameter-properties":                    [
            "error",
            {
                prefer: "parameter-property",
            },
        ],
        "unicorn/filename-case": [
            "error",
            {
                case: "kebabCase",
            },
        ],
        "unicorn/max-nested-calls":          "error",
        "unicorn/no-abusive-eslint-disable": "error",
        "unicorn/no-array-for-each":         "error",
        "unicorn/no-array-reduce":           "error",
        "unicorn/no-document-cookie":        "error",
        "unicorn/no-length-as-slice-end":    "error",
        "unicorn/no-lonely-if":              "off",
        "unicorn/no-nested-ternary":         "error",

        "unicorn/no-null":                  "allow",
        "unicorn/no-typeof-undefined":      "off",
        "unicorn/no-useless-undefined":     "off",
        "unicorn/prefer-modern-math-apis":  "warn",
        "unicorn/prefer-number-properties": "off",
        "unicorn/prefer-spread":            "off",
    },
    settings: {},
} satisfies OxlintConfig
