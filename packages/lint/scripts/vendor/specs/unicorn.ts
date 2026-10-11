import type { PluginSpec } from "../spec.ts"

function wrapExport(name: string): string {
    return [
        "import toEslintCreate from './rule/to-eslint-create.js';",
        "export default {",
        "    meta: { ...config.meta, docs: { ...config.meta.docs,",
        `        url: 'https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v64.0.0/docs/rules/${name}.md',`,
        "    } },",
        "    create: toEslintCreate(config.create),",
        "};",
    ].join("\n")
}

export default {
    dir:     "unicorn",
    install: { "eslint-plugin-unicorn": "64.0.0" },
    layout:  { kind: "rule-files", ruleFile: (name) => `rules/${name}.js` },
    patches: {
        "better-regex.js": [
            [
                "export default config;",
                wrapExport("better-regex"),
                "Unicorn 64 rule modules use context.on() rather than returning ESLint listeners; apply the upstream adapter retained in the import closure.",
            ],
        ],
        "consistent-destructuring.js": [
            [
                "import {getAvailableVariableName, isLeftHandSide} from './utils/index.js';",
                "import getAvailableVariableName from './utils/get-available-variable-name.js';\nimport isLeftHandSide from './utils/is-left-hand-side.js';",
                "Use the two required utility modules directly; the utility barrel otherwise imports ESLint built-in rules and unrelated helpers at runtime.",
            ],
            [
                "export default config;",
                wrapExport("consistent-destructuring"),
                "Apply the upstream toEslintCreate adapter (already copied via the upstream utility closure); raw unicorn modules do not return ESLint listeners.",
            ],
        ],
        "import-style.js": [
            [
                "export default config;",
                wrapExport("import-style"),
                "Unicorn 64 rule modules use context.on() rather than returning ESLint listeners; apply the upstream adapter retained in the import closure.",
            ],
        ],
        "utils/get-builtin-rule.js": [
            [
                "import {builtinRules} from 'eslint/use-at-your-own-risk';",
                "const builtinRules = new Map();",
                "This helper is not imported by the three vendored rules after narrowing the utility barrel; remove the dead module's third-party dependency too.",
            ],
        ],
        "utils/index.js": [
            [
                "export {default as getBuiltinRule} from './get-builtin-rule.js';",
                "",
                "None of the three vendored rules uses getBuiltinRule; remove the runtime dependency on ESLint from the unused utility barrel.",
            ],
        ],
    },
    pkg:    "eslint-plugin-unicorn",
    prefix: "unicorn",
} satisfies PluginSpec
