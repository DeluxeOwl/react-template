import path from "node:path"
import { createRequire, builtinModules } from "node:module"
import {
    build, type Plugin, type OutputFile,
} from "esbuild"
import {
    rmSync, mkdirSync, renameSync, writeFileSync,
} from "node:fs"

import { isRecord } from "./guards.ts"
import { installUpstream } from "./install.ts"
import { bareImports, packageName } from "./closure.ts"
import { readManifest, checkDeclared } from "./manifest.ts"
import { goRegExp, bundledLicenses } from "./specs/bundle.ts"

// Helper packages the vendored plugins import, which name ESLint as a peer dependency: as
// dependencies of @deluxeowl/lint they would install ESLint, although the parts the plugins use
// never load it. So they are bundled into vendor/_deps/, one module per import specifier (code they
// share goes into chunk files, so each helper module exists once), and vendor-plugin.ts points the
// plugins' imports at those modules.
export const inlinedImports: Record<string, string> = {
    "@eslint-community/eslint-utils":        "eslint-community-eslint-utils.js",
    "@typescript-eslint/parser":             "typescript-eslint-parser.js",
    "@typescript-eslint/type-utils":         "typescript-eslint-type-utils.js",
    "@typescript-eslint/utils":              "typescript-eslint-utils.js",
    "@typescript-eslint/utils/ast-utils":    "typescript-eslint-utils-ast-utils.js",
    "@typescript-eslint/utils/eslint-utils": "typescript-eslint-utils-eslint-utils.js",
    "eslint-import-resolver-typescript":     "eslint-import-resolver-typescript.js",
}

// The versions the vendored plugins were checked with: the lockfile's, before they were bundled.
const install: Record<string, string> = {
    "@eslint-community/eslint-utils":    "4.9.1",
    "@typescript-eslint/parser":         "8.59.1",
    "@typescript-eslint/type-utils":     "8.59.1",
    "@typescript-eslint/utils":          "8.59.1",
    "eslint-import-resolver-typescript": "4.4.4",
}

const tool = "packages/lint/scripts/vendor/vendor.ts"
const entryPrefix = "inlined:"
const inlinedPackages = new Set(Object.keys(install))

// @typescript-eslint/utils' index also exports TSESLint's ESLint, Linter and RuleTester, which load
// ESLint. Its importers (vitest's rules, type-utils) only use these pure parts.
const pureUtilsExports = ["AST_NODE_TYPES", "AST_TOKEN_TYPES", "ASTUtils", "ESLintUtils", "TSESLint", "TSESTree", "TSUtils"]

type InstallRequire = ReturnType<typeof createRequire>

function pureUtils(utilsDir: string): string {
    const file = (relative: string): string => JSON.stringify(path.join(utilsDir, relative))

    return [
        "const types = require(\"@typescript-eslint/types\");",
        "exports.AST_NODE_TYPES = types.AST_NODE_TYPES;",
        "exports.AST_TOKEN_TYPES = types.AST_TOKEN_TYPES;",
        "exports.TSESTree = types.TSESTree;",
        `exports.ASTUtils = require(${file("ast-utils/index.js")});`,
        `exports.ESLintUtils = require(${file("eslint-utils/index.js")});`,
        `exports.TSESLint = { Scope: require(${file("ts-eslint/Scope.js")}).Scope };`,
        `exports.TSUtils = require(${file("ts-utils/index.js")});`,
    ].join("\n")
}

// The entry module of one specifier re-exports its named exports, listed by loading the package
// from the install: the packages are mostly CommonJS, whose exports esbuild can't list itself.
function entrySource(installRequire: InstallRequire, specifier: string): string {
    const isUtilsIndex = specifier === "@typescript-eslint/utils"
    const loaded: unknown = isUtilsIndex ? undefined : installRequire(specifier)
    const names = isUtilsIndex ? pureUtilsExports : Object.keys(isRecord(loaded) ? loaded : {}).filter((name) => !["default", "__esModule"].includes(name))

    return [`import * as upstream from ${JSON.stringify(specifier)};`, `export const { ${names.toSorted().join(", ")} } = upstream;`, ""].join("\n")
}

// Bundles the inlined packages' code; every other package stays an import (a dependency of
// @deluxeowl/lint), and an import of ESLint fails the build.
function inliningPlugin(installDir: string): Plugin {
    const installRequire = createRequire(path.join(installDir, "package.json"))
    const utilsDir = path.dirname(installRequire.resolve("@typescript-eslint/utils"))

    return {
        name: "inlined-dependencies",
        setup(builder): void {
            builder.onResolve({ filter: goRegExp(`^${entryPrefix}`) }, ({ path: id }) => ({ namespace: "inlined", path: id.slice(entryPrefix.length) }))
            builder.onLoad({ filter: goRegExp(".*"), namespace: "inlined" }, ({ path: specifier }) => ({
                contents: entrySource(installRequire, specifier), loader: "js", resolveDir: installDir,
            }))
            builder.onResolve({ filter: goRegExp("^@typescript-eslint/utils$") }, () => ({ namespace: "pure-utils", path: "@typescript-eslint/utils" }))
            builder.onLoad({ filter: goRegExp(".*"), namespace: "pure-utils" }, () => ({
                contents: pureUtils(utilsDir), loader: "js", resolveDir: installDir,
            }))
            builder.onResolve({ filter: goRegExp("^eslint(?:/|$)") }, ({ importer }) => ({ errors: [{ text: `${importer} imports ESLint` }] }))
            builder.onResolve({ filter: goRegExp("^[^./]") }, ({ path: specifier }) => (inlinedPackages.has(packageName(specifier)) ? undefined : { external: true }))
        },
    }
}

interface DepsBundle {
    // the files esbuild read (absolute paths; virtual modules too)
    inputs: string[]
    files:  OutputFile[]
}

async function bundleInlined(installDir: string): Promise<DepsBundle> {
    const result = await build({
        absWorkingDir: installDir,
        banner:        { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
        bundle:        true,
        chunkNames:    "chunk-[hash]",
        entryPoints:   Object.entries(inlinedImports).map(([specifier, file]) => ({ in: `${entryPrefix}${specifier}`, out: path.basename(file, ".js") })),
        format:        "esm",
        legalComments: "eof",
        metafile:      true,
        outdir:        path.join(installDir, "deps"),
        platform:      "node",
        plugins:       [inliningPlugin(installDir)],
        splitting:     true,
        target:        "node22",
        write:         false,
    })

    return { files: result.outputFiles, inputs: Object.keys(result.metafile.inputs).map((file) => path.resolve(installDir, file)) }
}

function readme(installDir: string, external: Set<string>): string {
    const packages = [...inlinedPackages].map((name) => readManifest(path.join(installDir, "node_modules", name)))
        .map((manifest) => `- \`${manifest.name ?? "?"}@${manifest.version ?? "?"}\` (${manifest.license ?? "see THIRD_PARTY_LICENSES.txt"})`)

    return [
        "# Bundled helper packages (vendored)",
        "",
        `Generated by \`${tool}\` (\`scripts/vendor/deps.ts\`). Do not edit these files by hand: change deps.ts and run \`bun run vendor --all\` in packages/lint.`,
        "",
        "The vendored plugins use helpers from these packages. Each lists ESLint as a peer dependency, so installing them would install ESLint, although the parts the plugins use never load it. They are bundled here with esbuild instead; code they share is in the chunk files, so each helper module exists once.",
        "",
        ...packages,
        "",
        "The vendored plugins import these modules in place of the packages:",
        "",
        ...Object.entries(inlinedImports).map(([specifier, file]) => `- \`${specifier}\`: \`${file}\``),
        "",
        `\`@typescript-eslint/utils\` is reduced to the parts that don't load ESLint: ${pureUtilsExports.map((name) => `\`${name}\``).join(", ")} (\`TSESLint\` has only \`Scope\`). An import of ESLint in the bundled code stops the tool.`,
        "",
        `External runtime dependencies: ${[...external].toSorted().map((name) => `\`${name}\``)
            .join(", ")}.`,
        "",
        "Licenses of the bundled packages: THIRD_PARTY_LICENSES.txt.",
        "",
    ].join("\n")
}

function licensesText(inputs: string[]): string {
    return [...bundledLicenses(inputs, new Map())].toSorted(([left], [right]) => left.localeCompare(right))
        .map(([id, text]) => `${id}\n${"=".repeat(id.length)}\n\n${text.trim()}\n`)
        .join("\n")
}

// The packages the bundled modules import (Node built-ins aside).
function externalImports(dir: string, files: OutputFile[]): Set<string> {
    const specifiers = files.flatMap((file) => bareImports(path.join(dir, path.basename(file.path))))

    return new Set(specifiers.map((specifier) => packageName(specifier)).filter((name) => !builtinModules.includes(name)))
}

// Builds vendor/_deps/: the bundled modules, README.md and THIRD_PARTY_LICENSES.txt.
export async function vendorDependencies(lintDir: string): Promise<void> {
    const installDir = installUpstream({ dir: "_deps", install })
    const { files, inputs } = await bundleInlined(installDir)
    const target = path.join(lintDir, "vendor", "_deps.staging")
    rmSync(target, { force: true, recursive: true })
    mkdirSync(target, { recursive: true })
    for (const file of files) {
        writeFileSync(path.join(target, path.basename(file.path)), file.text)
    }
    const external = externalImports(target, files)
    checkDeclared(lintDir, { external, owner: "vendor/_deps" })
    writeFileSync(path.join(target, "THIRD_PARTY_LICENSES.txt"), licensesText(inputs))
    writeFileSync(path.join(target, "README.md"), readme(installDir, external))
    const final = path.join(lintDir, "vendor", "_deps")
    rmSync(final, { force: true, recursive: true })
    renameSync(target, final)
    console.log(`_deps: ${[...inlinedPackages].join(", ")}; ${files.length} files; external deps: ${[...external].toSorted().join(", ")}`)
}
