import type { Plugin } from "esbuild"

import path from "node:path"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"

import type {
    Patches, Upstream, PluginSpec,
} from "../spec.ts"

import { fail } from "../fail.ts"
import { packageRoot, readManifest } from "../manifest.ts"
import {
    field, asArray, isRecord,
} from "../guards.ts"
import {
    bundle, goRegExp, writeBundle, licenseNotices,
} from "./bundle.ts"

// eslint-plugin-unused-imports is an ES module wrapping a no-unused-vars rule it picks at runtime.
// Bundle it with the typescript-eslint base rule installed next to it (the one ESLint ran) and only
// the syntax-only part of that rule's imports: no ESLint runtime or third-party plugin is a runtime
// dependency of the result.
interface Paths {
    // @eslint/plugin-kit: its ConfigCommentParser methods are copied (inline `/* global */` comments)
    pluginKitDir: string
    scopeDir:     string
    tsDir:        string
    typesEntry:   string
    unusedDir:    string
    utilsDir:     string
}

function pathsOf(upstream: Upstream): Paths {
    const installRequire = createRequire(path.join(upstream.installDir, "package.json"))
    const unusedEntry = installRequire.resolve("eslint-plugin-unused-imports")
    const tsEntry = createRequire(unusedEntry).resolve("@typescript-eslint/eslint-plugin")
    const tsRequire = createRequire(tsEntry)
    const eslintRequire = createRequire(installRequire.resolve("eslint"))

    return {
        pluginKitDir: packageRoot(eslintRequire.resolve("@eslint/plugin-kit")).dir,
        scopeDir:     path.dirname(tsRequire.resolve("@typescript-eslint/scope-manager")),
        tsDir:        path.dirname(tsEntry),
        typesEntry:   tsRequire.resolve("@typescript-eslint/types"),
        unusedDir:    path.dirname(unusedEntry),
        utilsDir:     path.dirname(tsRequire.resolve("@typescript-eslint/utils")),
    }
}

function requireOf(file: string): string {
    return `require(${JSON.stringify(file)})`
}

function versionOf(dir: string): string {
    const { name, version } = readManifest(dir)

    return `${name ?? "?"}@${version ?? "?"}`
}

// The public utils/scope-manager barrels eagerly import ESLint/parser/referencer APIs this rule does
// not use; the bridges expose only the original pure APIs no-unused-vars uses.
function pureUtils(paths: Paths): string {
    return [
        `const types = ${requireOf(paths.typesEntry)};`,
        "exports.AST_NODE_TYPES = types.AST_NODE_TYPES;",
        "exports.AST_TOKEN_TYPES = types.AST_TOKEN_TYPES;",
        "exports.TSESTree = types.TSESTree;",
        `exports.ASTUtils = ${requireOf(path.join(paths.utilsDir, "ast-utils/index.js"))};`,
        `exports.ESLintUtils = ${requireOf(path.join(paths.utilsDir, "eslint-utils/index.js"))};`,
        `exports.TSESLint = { Scope: ${requireOf(path.join(paths.utilsDir, "ts-eslint/Scope.js"))}.Scope };`,
    ].join("\n")
}

function pureScope(paths: Paths): string {
    return [
        `exports.DefinitionType = ${requireOf(path.join(paths.scopeDir, "definition/DefinitionType.js"))}.DefinitionType;`,
        `exports.ScopeType = ${requireOf(path.join(paths.scopeDir, "scope/ScopeType.js"))}.ScopeType;`,
        `exports.Visitor = ${requireOf(path.join(paths.scopeDir, "referencer/Visitor.js"))}.Visitor;`,
        `exports.PatternVisitor = ${requireOf(path.join(paths.scopeDir, "referencer/PatternVisitor.js"))}.PatternVisitor;`,
        `exports.ImplicitLibVariable = ${requireOf(path.join(paths.scopeDir, "variable/ImplicitLibVariable.js"))}.ImplicitLibVariable;`,
    ].join("\n")
}

// The source of `function name(...) {...}` in `file` (top-level, so it ends at the first "\n}").
function originalFunction(file: string, name: string): string {
    const source = readFileSync(file, "utf8")
    const start = source.indexOf(`function ${name}(`)
    const end = source.indexOf("\n}", start) + "\n}".length

    return start === -1 || end < start ? fail(`cannot isolate ${name} in ${file}`) : source.slice(start, end)
}

// The source of method `name` of the class in `source` (indented by one tab).
function originalMethod(source: string, name: string): string {
    const start = source.indexOf(`\t${name}(`)
    const end = source.indexOf("\n\t}", start) + "\n\t}".length

    return start === -1 || end < start ? fail(`cannot isolate ConfigCommentParser.${name}`) : source.slice(start, end)
}

// Syntax-only typescript-eslint parsing defaults to `esnext` (analyze.js): the names of its exact
// lib data, not a hand-written list.
function implicitLibNames(paths: Paths): string[] {
    const names = new Set<string>()
    const visited = new Set<unknown>()
    const visit = (lib: unknown): void => {
        if (isRecord(lib) && !visited.has(lib)) {
            visited.add(lib)
            for (const variable of asArray(lib.variables)) {
                names.add(String(asArray(variable)[0]))
            }
            for (const child of asArray(lib.libs)) {
                visit(child)
            }
        }
    }
    const esnext: unknown = createRequire(paths.tsDir)(path.join(paths.scopeDir, "lib/esnext.js"))
    visit(field(esnext, "esnext"))

    return [...names].toSorted()
}

// oxc supplies TS-compatible scopes but does not do ESLint's inline-global initialization. Copy only
// its original parser methods (Apache-2.0), then call GlobalScope.addVariables (the API
// ScopeManager.addGlobals calls) before either wrapper creates the base rule. Reads and writes then
// resolve in the original scope objects; this is not a regex approximation of variable usage.
function inlineGlobalsCompatibility(paths: Paths): string[] {
    const parser = readFileSync(path.join(paths.pluginKitDir, "dist/esm/index.js"), "utf8")
    const directiveClass = parser.indexOf("class DirectiveComment {")

    return [
        `// Modified for oxlint: inline global initialization, using ${versionOf(paths.pluginKitDir)} parser methods by Nicholas C. Zakas (Apache-2.0; full license below).`,
        `// ${versionOf(path.dirname(paths.tsDir)).replace("@typescript-eslint/eslint-plugin", "typescript-eslint")} implicit esnext lib variables are excluded by its no-unused-vars visitor even when mentioned in a global directive.`,
        `const implicitTypeScriptGlobals = new Set(${JSON.stringify(implicitLibNames(paths))});`,
        parser.slice(parser.indexOf("const directivesPattern ="), parser.indexOf("const validSeverities =")).trim(),
        parser.slice(directiveClass, parser.indexOf("\n}", directiveClass) + "\n}".length),
        "class InlineGlobalCommentParser {",
        originalMethod(parser, "parseStringConfig"),
        originalMethod(parser, "#extractDirectiveComment"),
        originalMethod(parser, "parseDirective"),
        "}",
        "const inlineGlobalsPrepared = new WeakSet();",
        "const inlineGlobalParser = new InlineGlobalCommentParser();",
        "function prepareInlineGlobals(context) {",
        "    const sourceCode = context.sourceCode;",
        "    if (inlineGlobalsPrepared.has(sourceCode.ast)) return;",
        "    inlineGlobalsPrepared.add(sourceCode.ast);",
        "    const inline = new Map();",
        "    for (const comment of sourceCode.getAllComments()) {",
        "        if (comment.type !== 'Block') continue;",
        "        const directive = inlineGlobalParser.parseDirective(comment.value);",
        "        if (!directive || (directive.label !== 'global' && directive.label !== 'globals')) continue;",
        "        for (const [name, value] of Object.entries(inlineGlobalParser.parseStringConfig(directive.value))) {",
        "            if (![null, 'off', 'true', 'false', 'writeable', 'writable', 'readable', 'readonly'].includes(value)) continue;",
        "            const prior = inline.get(name);",
        "            inline.set(name, { value, comments: [...(prior?.comments ?? []), comment] });",
        "        }",
        "    }",
        "    const global = sourceCode.scopeManager.scopes[0];",
        "    const active = [...inline].filter(([, entry]) => entry.value !== 'off');",
        "    global.addVariables(active.map(([name]) => name));",
        "    for (const [name, entry] of active) {",
        "        const variable = global.set.get(name);",
        "        if (implicitTypeScriptGlobals.has(name)) variable.eslintUsed = true;",
        "        variable.eslintExplicitGlobal = true;",
        "        variable.eslintExplicitGlobalComments = entry.comments;",
        "        variable.writeable = ['true', 'writeable', 'writable'].includes(entry.value);",
        "    }",
        "}",
    ]
}

function narrowRuleUtils(paths: Paths): string {
    const utilDir = path.join(paths.tsDir, "util")

    return [
        "const utils = require(\"@typescript-eslint/utils\");",
        `exports.createRule = ${requireOf(path.join(utilDir, "createRule.js"))}.createRule;`,
        `exports.collectVariables = ${requireOf(path.join(utilDir, "collectUnusedVariables.js"))}.collectVariables;`,
        "exports.isFunction = utils.ASTUtils.isFunction;",
        "exports.nullThrows = utils.ESLintUtils.nullThrows;",
        "exports.NullThrowsReasons = utils.ESLintUtils.NullThrowsReasons;",
        `const escapeRegExp_1 = ${requireOf(path.join(utilDir, "escapeRegExp.js"))};`,
        originalFunction(path.join(utilDir, "astUtils.js"), "getNameLocationInGlobalDirectiveComment"),
        "exports.getNameLocationInGlobalDirectiveComment = getNameLocationInGlobalDirectiveComment;",
        // TypeScript's Extension.Dts/Dcts/Dmts: no need to load the compiler to recognize these.
        "const DEFINITION_EXTENSIONS = [\".d.ts\", \".d.cts\", \".d.mts\"];",
        originalFunction(path.join(utilDir, "misc.js"), "isDefinitionFile"),
        "exports.isDefinitionFile = isDefinitionFile;",
    ].join("\n")
}

// The upstream module, with its rule loader replaced by the installed typescript-eslint base rule.
function entry(paths: Paths): string {
    const source = readFileSync(path.join(paths.unusedDir, "index.mjs"), "utf8")
    const loaderStart = source.indexOf("// src/rules/load-rule.ts")
    const loaderEnd = source.indexOf("// src/rules/no-unused-vars.ts")
    if (loaderStart === -1 || loaderEnd < loaderStart) {
        fail("unused-imports loader boundary changed")
    }

    return [
        `import baseNoUnusedVars from ${JSON.stringify(path.join(paths.tsDir, "rules/no-unused-vars.js"))};`,
        "const noUnusedVarsBase = baseNoUnusedVars.default ?? baseNoUnusedVars;",
        source.slice(0, loaderStart),
        "// The typescript-eslint base rule ESLint ran (pinned, syntax-only).",
        "function getBaseRule() { return noUnusedVarsBase; }",
        source.slice(loaderEnd),
    ].join("\n")
}

function bridges(paths: Paths): Plugin {
    const modules: Record<string, string> = { scope: pureScope(paths), utils: pureUtils(paths) }
    const ruleFile = path.join(paths.tsDir, "rules/no-unused-vars.js")

    return {
        name: "isolated-unused-imports-base-rule",
        setup(builder): void {
            builder.onResolve({ filter: goRegExp("^@typescript-eslint/utils$") }, () => ({ namespace: "small-unused-pure", path: "utils" }))
            builder.onResolve({ filter: goRegExp("^@typescript-eslint/scope-manager$") }, () => ({ namespace: "small-unused-pure", path: "scope" }))
            builder.onLoad({ filter: goRegExp(".*"), namespace: "small-unused-pure" }, ({ path: name }) => ({
                contents: modules[name], loader: "js", resolveDir: paths.tsDir,
            }))
            builder.onResolve({ filter: goRegExp(String.raw`^\.\./util$`) }, ({ importer }) => importer === ruleFile ? { namespace: "small-unused-pure-util", path: "rule-utils" } : undefined)
            builder.onLoad({ filter: goRegExp(".*"), namespace: "small-unused-pure-util" }, () => ({
                contents: narrowRuleUtils(paths), loader: "js", resolveDir: paths.tsDir,
            }))
        },
    }
}

async function build(upstream: Upstream): Promise<string> {
    const paths = pathsOf(upstream)
    const { inputs, text } = await bundle(upstream, {
        entry: {
            contents: entry(paths), resolveDir: paths.unusedDir, sourcefile: path.join(paths.unusedDir, "index.mjs"),
        },
        external: ["@eslint-community/eslint-utils", "@typescript-eslint/types", "eslint-visitor-keys"],
        plugin:   bridges(paths),
    })
    const own = [path.dirname(paths.unusedDir), paths.pluginKitDir].map((dir) => [versionOf(dir), readFileSync(path.join(dir, "LICENSE"), "utf8")] as const)

    return writeBundle(upstream, `${text}\n${licenseNotices(inputs, new Map(own))}\n`)
}

function patches(upstream: Upstream): Patches {
    const paths = pathsOf(upstream)

    return {
        "plugin.mjs": [
            [
                "function getBaseRule() {\n  return noUnusedVarsBase;\n}",
                `${inlineGlobalsCompatibility(paths).join("\n")}\nfunction getBaseRule() {\n  return noUnusedVarsBase;\n}`,
                `The dynamic base-rule loader is replaced while bundling with the exact base ESLint ran (${versionOf(path.dirname(paths.tsDir))} no-unused-vars); only original syntax-only helpers are included, with their licenses. No third-party ESLint plugin or ESLint runtime is loaded by the generated code. Restore ESLint's inline-global scope initialization using its original parser methods and oxc's GlobalScope.addVariables API.`,
            ], [
                "    create(context) {\n      return baseRule.create(",
                "    create(context) {\n      prepareInlineGlobals(context);\n      return baseRule.create(",
                "Initialize inline /* global(s) */ comments before no-unused-vars creates its base-rule listeners; once per AST when the two wrapper rules run together.",
            ],
        ],
    }
}

export default {
    dir:     "unused-imports",
    install: {
        "@eslint/plugin-kit":               "0.7.1",
        "@typescript-eslint/eslint-plugin": "8.59.1",
        "eslint":                           "10.3.0",
        "eslint-plugin-unused-imports":     "4.4.1",
    },
    layout: { build, kind: "bundle" },
    patches,
    pkg:    "eslint-plugin-unused-imports",
    prefix: "unused-imports",
} satisfies PluginSpec
