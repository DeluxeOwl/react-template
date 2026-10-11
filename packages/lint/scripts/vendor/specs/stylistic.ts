import type { PluginSpec } from "../spec.ts"

export default {
    dir:     "stylistic",
    install: { "@stylistic/eslint-plugin": "5.10.0" },
    layout:  { kind: "rule-files", ruleFile: (name) => `dist/rules/${name}.js` },
    patches: {
        "rules/indent.js": [
            [
                `import { E as getCommentsBetween, I as isEqToken, K as isSingleLine, Q as warnDeprecatedOptions, S as STATEMENT_LIST_PARENTS, T as createGlobalLinebreakMatcher, W as isQuestionToken, Z as skipChainExpression, f as createRule, g as import_ast_utils, l as isESTreeSourceCode, m as AST_NODE_TYPES } from "../utils.js";`,
                `import { E as getCommentsBetween, I as isEqToken, K as isSingleLine, Q as warnDeprecatedOptions, S as STATEMENT_LIST_PARENTS, T as createGlobalLinebreakMatcher, W as isQuestionToken, Z as skipChainExpression, f as createRule, g as import_ast_utils, l as isESTreeSourceCode, m as AST_NODE_TYPES } from "../utils.js";\nimport { jsxStringValue } from "../../_compat/jsx-entities.js";`,
                "import the JSX entity decoder",
            ],
            [
                "Array.from(String(node.value).matchAll(nodeIndentRegExp)",
                "Array.from(String(jsxStringValue(node)).matchAll(nodeIndentRegExp)",
                "JSXText indentation: oxc leaves HTML entities undecoded in `JSXText.value`; `&nbsp;` decodes to U+00A0, which `\\S` does not match",
            ],
        ],
        "rules/jsx-quotes.js": [
            [
                `import { J as isSurroundedBy, f as createRule, q as isStringLiteral } from "../utils.js";`,
                `import { J as isSurroundedBy, f as createRule, q as isStringLiteral } from "../utils.js";\nimport { jsxStringValue } from "../../_compat/jsx-entities.js";`,
                "import the JSX entity decoder",
            ],
            [
                "return node.value.includes(setting.quote) || isSurroundedBy(node.raw, setting.quote);",
                "return jsxStringValue(node).includes(setting.quote) || isSurroundedBy(node.raw, setting.quote);",
                "oxc leaves HTML entities undecoded in JSX attribute values; decode from `raw` like typescript-estree",
            ],
        ],
    },
    pkg:    "@stylistic/eslint-plugin",
    prefix: "@stylistic",
} satisfies PluginSpec
