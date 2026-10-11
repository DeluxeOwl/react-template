import type { Plugin } from "esbuild"

import path from "node:path"
import { createRequire } from "node:module"

import type { Upstream, PluginSpec } from "../spec.ts"

import { packageRoot } from "../manifest.ts"
import {
    bundle, goRegExp, writeBundle, licenseNotices,
} from "./bundle.ts"

// typescript-eslint's rule modules are CommonJS that require() directories, and their shared util
// barrel reaches ESLint's runtime. So the selected rules are bundled into one ES module, with the
// barrels swapped for bridges to the pure helpers the rules use; the tool then copies the bundle and
// applies the patch below.
interface Paths {
    // eslint's package directory: two of its core rules are bundled (their TS versions extend them)
    eslintDir:   string
    estreeDir:   string
    typesEntry:  string
    upstreamDir: string
    utilsDir:    string
}

// The TS rules we use that extend a core rule (through getESLintCoreRule).
const coreRules = ["no-magic-numbers", "no-restricted-imports"]

function pathsOf(upstream: Upstream): Paths {
    const installRequire = createRequire(path.join(upstream.installDir, "package.json"))
    const upstreamEntry = createRequire(installRequire.resolve("typescript-eslint")).resolve("@typescript-eslint/eslint-plugin")
    const upstreamRequire = createRequire(upstreamEntry)

    return {
        eslintDir:   packageRoot(installRequire.resolve("eslint")).dir,
        estreeDir:   path.dirname(createRequire(upstreamRequire.resolve("@typescript-eslint/type-utils")).resolve("@typescript-eslint/typescript-estree")),
        typesEntry:  upstreamRequire.resolve("@typescript-eslint/types"),
        upstreamDir: path.dirname(upstreamEntry),
        utilsDir:    path.dirname(upstreamRequire.resolve("@typescript-eslint/utils")),
    }
}

function requireOf(file: string): string {
    return `require(${JSON.stringify(file)})`
}

// @typescript-eslint/utils' index eagerly imports TSESLint.ESLint/Linter/RuleTester, none of which
// rules need: expose the original pure helpers instead.
function pureUtils(paths: Paths): string {
    return [
        `const types = ${requireOf(paths.typesEntry)};`,
        "exports.AST_NODE_TYPES = types.AST_NODE_TYPES;",
        "exports.AST_TOKEN_TYPES = types.AST_TOKEN_TYPES;",
        "exports.TSESTree = types.TSESTree;",
        `exports.ASTUtils = ${requireOf(path.join(paths.utilsDir, "ast-utils/index.js"))};`,
        `exports.ESLintUtils = ${requireOf(path.join(paths.utilsDir, "eslint-utils/index.js"))};`,
        `exports.TSESLint = { Scope: ${requireOf(path.join(paths.utilsDir, "ts-eslint/Scope.js"))}.Scope };`,
        `exports.TSUtils = ${requireOf(path.join(paths.utilsDir, "ts-utils/index.js"))};`,
    ].join("\n")
}

// type-utils only imports these compiler helpers; the estree index also imports a whole
// parser/project service, which no rule needs.
function pureEstree(paths: Paths): string {
    return [
        `Object.assign(exports, ${requireOf(path.join(paths.estreeDir, "getModifiers.js"))});`,
        `Object.assign(exports, ${requireOf(path.join(paths.estreeDir, "version-check.js"))});`,
        `exports.getCanonicalFileName = ${requireOf(path.join(paths.estreeDir, "create-program/shared.js"))}.getCanonicalFileName;`,
        `Object.assign(exports, ${requireOf(path.join(paths.estreeDir, "ts-estree/index.js"))});`,
    ].join("\n")
}

// The two core rules, not eslint/use-at-your-own-risk (which imports all of ESLint).
function coreBridge(paths: Paths): string {
    return [
        `const utils = require("@typescript-eslint/utils");`,
        `const rules = new Map([`,
        ...coreRules.map((name) => `    [${JSON.stringify(name)}, ${requireOf(path.join(paths.eslintDir, "lib/rules", `${name}.js`))}],`),
        "]);",
        `exports.getESLintCoreRule = (ruleId) => utils.ESLintUtils.nullThrows(rules.get(ruleId), \`ESLint's core rule '\${ruleId}' not found.\`);`,
        "exports.maybeGetESLintCoreRule = (ruleId) => rules.get(ruleId) ?? null;",
    ].join("\n")
}

// Imports the rules in name order: that decides where their modules land in the bundle, not the
// order index.js registers them in.
function entry(rules: string[], paths: Paths): string {
    return [
        ...rules.map((name, index) => `import * as rule${index} from ${JSON.stringify(path.join(paths.upstreamDir, "rules", `${name}.js`))};`),
        "const ruleOf = (mod) => [mod.default?.default, mod.default, mod].find((candidate) => typeof candidate?.create === 'function');",
        "export default { rules: {",
        ...rules.map((name, index) => `    ${JSON.stringify(name)}: ruleOf(rule${index}),`),
        "} };",
    ].join("\n")
}

function bridges(paths: Paths): Plugin {
    const modules: Record<string, string> = { estree: pureEstree(paths), utils: pureUtils(paths) }

    return {
        name: "pure-typescript-eslint-rule-dependencies",
        setup(builder): void {
            builder.onResolve({ filter: goRegExp("^@typescript-eslint/utils$") }, () => ({ namespace: "pure-ts-rule-utils", path: "utils" }))
            builder.onResolve({ filter: goRegExp("^@typescript-eslint/typescript-estree$") }, () => ({ namespace: "pure-ts-rule-utils", path: "estree" }))
            builder.onLoad({ filter: goRegExp(".*"), namespace: "pure-ts-rule-utils" }, ({ path: name }) => ({
                contents: modules[name], loader: "js", resolveDir: paths.upstreamDir,
            }))
            builder.onLoad({ filter: goRegExp(String.raw`/util/getESLintCoreRule\.js$`) }, () => ({
                contents: coreBridge(paths), loader: "js", resolveDir: paths.upstreamDir,
            }))
        },
    }
}

async function build(upstream: Upstream): Promise<string> {
    const paths = pathsOf(upstream)
    const { inputs, text } = await bundle(upstream, {
        entry: {
            contents: entry(upstream.rules.toSorted(), paths), resolveDir: paths.upstreamDir, sourcefile: "typescript-eslint-rule-entry.mjs",
        },
        external: ["typescript", "@eslint-community/eslint-utils", "@typescript-eslint/types", "eslint-visitor-keys"],
        plugin:   bridges(paths),
    })
    // The import scanner would take the require() in this comment, and Acorn's AMD "exports"
    // pseudo-dependency, for imports: rephrase the comment and build the same AMD string from char codes.
    const source = text
        .replace("(and `import Foo = require('...')`)", "(and CommonJS-style imports)")
        .replace("define([\"exports\"], factory)", "define([String.fromCharCode(101, 120, 112, 111, 114, 116, 115)], factory)")

    return writeBundle(upstream, `${source}\n${licenseNotices(inputs, new Map())}\n`)
}

export default {
    dir:     "typescript-eslint",
    // acorn, ignore, semver and supports-color are bundled into plugin.mjs: pinned like the plugin
    install: {
        "acorn":             "8.16.0",
        "eslint":            "10.3.0",
        "ignore":            "7.0.5",
        "semver":            "7.7.4",
        "supports-color":    "7.2.0",
        "typescript-eslint": "8.59.1",
    },
    layout:  { build, kind: "bundle" },
    patches: {
        "plugin.mjs": [
            [
                "const compilerOptions = (0, util_1.getParserServices)(context, true).program?.getCompilerOptions() ?? {};",
                "const compilerOptions = context.options.some((option) => option.types?.length) ? (0, util_1.getParserServices)(context, true).program?.getCompilerOptions() ?? {} : {};",
                "naming-convention: the repo has no types selectors; skip the unconditional parser-services lookup only in that syntax-only case (ESNext quoting is equivalent for our ES2022/ESNext workspaces)",
            ],
        ],
    },
    pkg:    "typescript-eslint",
    prefix: "@typescript-eslint",
} satisfies PluginSpec
