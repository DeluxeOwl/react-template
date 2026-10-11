import type { PluginSpec } from "../spec.ts"

const moduleScopeSourceCode = [
    "const originalSourceCode = context.sourceCode;",
    "\t\tconst needsModuleScopes = originalSourceCode.ast.sourceType === 'script' && /\\.(?:m?js|jsx|ts|tsx)$/u.test(context.filename);",
    "\t\tconst moduleScopes = needsModuleScopes ? require('@typescript-eslint/scope-manager').analyze(originalSourceCode.ast, {",
    "\t\t\tsourceType: 'module', impliedStrict: true, lib: [], jsxPragma: 'React',",
    "\t\t}) : null;",
    "\t\tconst sourceCode = moduleScopes ? Object.create(originalSourceCode, {",
    "\t\t\tgetDeclaredVariables: { value: node => moduleScopes.getDeclaredVariables(node) },",
    "\t\t}) : originalSourceCode;",
].join("\n")

export default {
    dir:     "eslint",
    install: { eslint: "10.3.0" },
    layout:  { kind: "rule-files", ruleFile: (name) => `lib/rules/${name}.js` },
    patches: {
        "upstream/lib/rules/no-var.js": [
            [
                "const sourceCode = context.sourceCode;",
                moduleScopeSourceCode,
                "ESLint treats the configured JS/TS file families as modules, including files without imports/exports. Oxlint infers those files as scripts, so no-var refuses fixes for their global variables. Re-analyze the same AST nodes with ESLint's module-scope policy for this rule only; retain every upstream safety predicate.",
            ],
        ],
    },
    pkg:    "eslint",
    prefix: "",
} satisfies PluginSpec
