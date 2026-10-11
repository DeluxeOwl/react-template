import type { PluginSpec } from "../spec.ts"

const combinedImports = [
    ["AST_NODE_TYPES3", "ESLintUtils"],
    ["AST_NODE_TYPES4", "ESLintUtils2"],
    ["AST_NODE_TYPES6", "ESLintUtils3"],
    ["AST_NODE_TYPES7", "ESLintUtils4"],
    ["AST_NODE_TYPES8", "ESLintUtils5"],
    ["AST_NODE_TYPES9", "ESLintUtils7"],
] as const
const constantImports = [
    ["AST_NODE_TYPES", "AST_NODE_TYPES"],
    ["TSESTree", "TSESTree"],
    ["AST_NODE_TYPES", "AST_NODE_TYPES2"],
    ["AST_NODE_TYPES", "AST_NODE_TYPES5"],
] as const
const importsWithoutEslint: [string, string, string][] = [
    ...combinedImports.map(([astAlias, utilsAlias]): [string, string, string] => [
        `import { AST_NODE_TYPES as ${astAlias}, ESLintUtils${utilsAlias === "ESLintUtils" ? "" : ` as ${utilsAlias}`} } from "@typescript-eslint/utils";`,
        `import { AST_NODE_TYPES as ${astAlias} } from "@typescript-eslint/types";\nimport * as ${utilsAlias} from "@typescript-eslint/utils/eslint-utils";`,
        "Import only AST constants and rule-construction helpers; the utils root eagerly loads ESLint/RuleTester, which a vendored oxlint plugin must not require",
    ]),
    ...constantImports.map(([name, alias]): [string, string, string] => [
        `import { ${name}${name === alias ? "" : ` as ${alias}`} } from "@typescript-eslint/utils";`,
        `import { ${name}${name === alias ? "" : ` as ${alias}`} } from "@typescript-eslint/types";`,
        "Import AST constants directly rather than the utils root that eagerly imports ESLint",
    ]),
    [
        "import { ESLintUtils as ESLintUtils6 } from \"@typescript-eslint/utils\";",
        "import * as ESLintUtils6 from \"@typescript-eslint/utils/eslint-utils\";",
        "Use the lightweight rule-construction helper subpath; no-void-query-fn remains disabled in oxlint because it needs parser services",
    ],
]

export default {
    dir:     "tanstack-query",
    install: { "@tanstack/eslint-plugin-query": "5.100.9" },
    layout:  { kind: "plugin", pluginFile: "build/modern/rules.js" },
    patches: { "chunk-CI2SSAE2.js": importsWithoutEslint },
    pkg:     "@tanstack/eslint-plugin-query",
    prefix:  "@tanstack/query",
} satisfies PluginSpec
