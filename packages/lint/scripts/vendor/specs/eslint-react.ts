import type { PluginSpec } from "../spec.ts"

const utilsWhy = "Import the helper namespace from its subpath: the root of @typescript-eslint/utils imports ESLint, which oxlint doesn't need"
const eslintUtils: [string, string, string] = [
    "import { ESLintUtils } from \"@typescript-eslint/utils\";",
    "import * as ESLintUtils from \"@typescript-eslint/utils/eslint-utils\";",
    utilsWhy,
]

const entitiesWhy = "oxc keeps HTML entities undecoded in JSX text and attribute strings, while typescript-estree (ESLint's parser) decodes them (`&#36;` → `$`): read the decoded value like ESLint did"

export default {
    dir:     "eslint-react",
    install: { "@eslint-react/eslint-plugin": "5.7.1" },
    layout:  {
        family:     (name) => name.startsWith("@eslint-react/") || name.startsWith("eslint-plugin-react-"),
        kind:       "packages",
        pluginFile: "dist/index.js",
    },
    patches: {
        "@eslint-react/ast/lib/index.js": [
            [
                "import { ASTUtils } from \"@typescript-eslint/utils\";",
                "import * as ASTUtils from \"@typescript-eslint/utils/ast-utils\";\nimport { jsxStringValue } from \"../../../../_compat/jsx-entities.js\";",
                utilsWhy,
            ],
            ["case AST_NODE_TYPES.JSXText: return node.value;", "case AST_NODE_TYPES.JSXText: return jsxStringValue(node);", entitiesWhy],
        ],
        "@eslint-react/eslint/lib/index.js": [eslintUtils],
        "@eslint-react/jsx/lib/index.js":    [
            [
                "import { AST_NODE_TYPES } from \"@typescript-eslint/types\";",
                "import { AST_NODE_TYPES } from \"@typescript-eslint/types\";\nimport { jsxStringValue } from \"../../../../_compat/jsx-entities.js\";",
                entitiesWhy,
            ],
            ["const staticValue = node.value.value;", "const staticValue = jsxStringValue(node.value);", entitiesWhy],
        ],
        "eslint-plugin-react-dom/lib/index.js": [eslintUtils],
        "eslint-plugin-react-jsx/lib/index.js": [
            [
                eslintUtils[0],
                `${eslintUtils[1]}\nimport { jsxStringValue } from "../../../_compat/jsx-entities.js";`,
                utilsWhy,
            ],
            ["!child.value.endsWith(\"$\")", "!jsxStringValue(child).endsWith(\"$\")", entitiesWhy],
            ["if (child.value === \"$\" && node.children.length === 2)", "if (jsxStringValue(child) === \"$\" && node.children.length === 2)", entitiesWhy],
        ],
        "eslint-plugin-react-naming-convention/lib/index.js": [eslintUtils],
        "eslint-plugin-react-rsc/lib/index.js":               [eslintUtils],
        "eslint-plugin-react-web-api/lib/index.js":           [eslintUtils],
        "eslint-plugin-react-x/lib/index.js":                 [eslintUtils],
    },
    pkg:    "@eslint-react/eslint-plugin",
    prefix: "@eslint-react",
} satisfies PluginSpec
