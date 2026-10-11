import type { PluginSpec } from "../spec.ts"

const resolver = [
    "const resolverWorkspaceCache = new Map();",
    "function resolverWorkspace(context) {",
    "    const packagePath = pkgUp({ cwd: node_path.default.dirname(context.physicalFilename) });",
    "    return packagePath ? node_path.default.dirname(packagePath) : context.cwd;",
    "}",
    "function resolveWithRepoSettings(modulePath, sourceFile, context) {",
    "    const workspace = resolverWorkspace(context);",
    "    let resolver = resolverWorkspaceCache.get(workspace);",
    "    if (!resolver) {",
    "        resolver = repoTypeScriptResolver.createTypeScriptImportResolver({",
    "            alwaysTryTypes: true, bun: true, project: [workspace],",
    "        });",
    "        resolverWorkspaceCache.set(workspace, resolver);",
    "    }",
    "    return eslint_import_context.setRuleContext(context, () => resolver.resolve(modulePath, sourceFile));",
    "}",
    "function fullResolve(modulePath, sourceFile, settings, context) {",
    "    if (!settings['import-x/resolver-next'] && !settings['import-x/resolver'] && !settings['import-x/resolver-legacy']) {",
    "        return resolveWithRepoSettings(modulePath, sourceFile, context);",
    "    }",
].join("\n")

export default {
    dir:     "import-x",
    install: { "eslint-plugin-import-x": "4.16.2" },
    layout:  { kind: "plugin", pluginFile: "lib/index.cjs" },
    patches: {
        "index.cjs": [
            [
                "const { name, version } = cjsRequire(\"../package.json\");",
                "const name = 'eslint-plugin-import-x', version = '4.16.2';",
                "Pin metadata to the installed upstream version without requiring package.json outside the vendored bundle.",
            ],
            [
                "const eslint = __toESM(require(\"eslint\"));",
                "const remoteParser = require('@typescript-eslint/parser');\nconst repoTypeScriptResolver = require('eslint-import-resolver-typescript');",
                "These rules only use ESLint SourceCode for lazily captured documentation, never for diagnostics. Remove ESLint; use the repo's original parser and resolver as generic runtime helpers for remote modules.",
            ],
            [
                "const eslint_use_at_your_own_risk = __toESM(require(\"eslint/use-at-your-own-risk\"));",
                "const eslint_use_at_your_own_risk = { default: {} };",
                "The copied bundle includes no-unused-modules but index.js does not expose it; no exposed rule uses ESLint's FileEnumerator. Remove that unused third-party import.",
            ],
            [
                "\tconst parser = \"languageOptions\" in context && context.languageOptions?.parser;",
                "\tconst parser = remoteParser;",
                "Oxlint supplies a parser-shaped stub whose parse() method throws. Use the repo's typescript-eslint parser for remote modules, while retaining the upstream alternate-parser settings branch.",
            ],
            [
                "\t\tconst source = new eslint.SourceCode({\n\t\t\ttext: content,\n\t\t\tast\n\t\t});",
                "\t\tconst source = { getCommentsBefore: (node) => (ast.comments || []).filter(comment => comment.range[1] <= node.range[0]) };",
                "No exposed rule reads the lazy doc metadata. A comment-only facade removes the otherwise eager ESLint SourceCode construction without changing any exposed rule's diagnostics or fixes.",
            ],
            [
                "function fullResolve(modulePath, sourceFile, settings, context) {",
                resolver,
                "Oxlint settings cannot carry ESLint resolver functions; recreate the repo's exact alwaysTryTypes/bun/project resolver options per importing workspace when no callable resolver was supplied.",
            ],
        ],
    },
    pkg:    "eslint-plugin-import-x",
    prefix: "import-x",
} satisfies PluginSpec
