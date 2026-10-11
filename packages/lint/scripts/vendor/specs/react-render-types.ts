import type { PluginSpec } from "../spec.ts"

export default {
    dir:     "react-render-types",
    install: { "eslint-plugin-react-render-types": "0.7.6" },
    layout:  { kind: "rule-files", ruleFile: (name) => `dist/rules/${name}.js` },
    patches: {
        "utils/create-rule.js": [
            [
                "import { ESLintUtils } from \"@typescript-eslint/utils\";",
                "import * as ESLintUtils from \"@typescript-eslint/utils/eslint-utils\";",
                "Import only rule-construction helpers; the utils root eagerly imports ESLint, but renders-uses-vars needs no ESLint runtime or type checker",
            ],
        ],
    },
    pkg:    "eslint-plugin-react-render-types",
    prefix: "react-render-types",
} satisfies PluginSpec
