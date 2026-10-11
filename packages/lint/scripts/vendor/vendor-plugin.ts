import path from "node:path"
import { builtinModules } from "node:module"
import {
    rmSync, mkdirSync, existsSync, renameSync, readdirSync, copyFileSync, readFileSync, realpathSync, writeFileSync,
} from "node:fs"

import type { Job, EntryCode } from "./job.ts"
import type { Upstream, PluginSpec } from "./spec.ts"

import { fail } from "./fail.ts"
import { selectRules } from "./rules.ts"
import { inlinedImports } from "./deps.ts"
import { field, isRecord } from "./guards.ts"
import { installUpstream } from "./install.ts"
import {
    writeEntry, copyLicense, writeCompat, writeReadme,
} from "./write.ts"
import {
    licenseFile, packageRoot, readManifest, checkDeclared,
} from "./manifest.ts"
import {
    commonDir, bareImports, packageName, localImports, collectClosure,
} from "./closure.ts"

const lintDir = path.resolve(import.meta.dirname, "../..")
const JsonIndent = 4

interface EntryFiles {
    pluginFile: string | undefined
    ruleFiles:  Map<string, string>
}

async function entryFiles(spec: PluginSpec, upstream: Upstream): Promise<EntryFiles> {
    const { layout } = spec
    if (layout.kind === "rule-files") {
        return { pluginFile: undefined, ruleFiles: new Map(upstream.rules.map((name) => [name, path.join(upstream.packageDir, layout.ruleFile(name))])) }
    }
    const pluginFile = layout.kind === "bundle" ? await layout.build(upstream) : path.join(upstream.packageDir, layout.pluginFile)

    return { pluginFile, ruleFiles: new Map() }
}

// Packages ship their code in `dist/`, which .gitignore (and tools that honour it, like knip) skip,
// so the "packages" layout names those folders `lib/`. The relative layout inside a package is kept.
function packagePath(target: string): (file: string) => string {
    return (file) => {
        const { dir, name } = packageRoot(file)
        const relative = path.relative(dir, file).split(path.sep)
            .map((segment) => segment === "dist" ? "lib" : segment)

        return path.join(target, name, ...relative)
    }
}

interface FlatLayout {
    isCommonJs: boolean
    files:      string[]
}

// The generated entry is index.js (+ index.d.ts): if upstream has a file of that name at the top
// (eslint-plugin-react-refresh's single-file bundle), all upstream files go to upstream/. So do
// CommonJS `.js` files (ESLint's own rules): packages/lint is `"type": "module"`, so upstream/ gets
// a package.json that keeps them CommonJS.
function flatPath(target: string, { files, isCommonJs }: FlatLayout): (file: string) => string {
    const baseDir = commonDir(files)
    const collides = files.some((file) => ["index.js", "index.d.ts"].includes(path.relative(baseDir, file)))

    return (file) => path.join(target, collides || isCommonJs ? "upstream" : "", path.relative(baseDir, file))
}

async function stage(spec: PluginSpec): Promise<Job> {
    const installDir = installUpstream(spec)
    const packageDir = realpathSync(path.join(installDir, "node_modules", spec.pkg))
    const upstream: Upstream = {
        installDir, packageDir, rules: selectRules(spec),
    }
    const { pluginFile, ruleFiles } = await entryFiles(spec, upstream)
    const additionalFiles = (spec.additionalFiles ?? []).map((file) => path.join(packageDir, file))
    const roots = [...pluginFile === undefined ? ruleFiles.values() : [pluginFile], ...additionalFiles]
    const closure = collectClosure(roots, spec.layout.kind === "packages" ? spec.layout.family : undefined)
    const manifest = readManifest(packageDir)
    const files = [...closure.files]
    const isCommonJs = manifest.type !== "module" && files.some((file) => file.endsWith(".js"))
    const target = path.join(lintDir, "vendor", `${spec.dir}.staging`)
    const vendoredPath = spec.layout.kind === "packages" ? packagePath(target) : flatPath(target, { files, isCommonJs })
    rmSync(target, { force: true, recursive: true })
    mkdirSync(target, { recursive: true })

    return {
        closure, family: [], isCommonJs, manifest, pluginFile, roots, ruleFiles, spec, target, upstream, vendoredPath,
    }
}

function copyFiles(job: Job): void {
    const files = [...job.closure.files]
    if (new Set(files.map((file) => job.vendoredPath(file))).size !== files.length) {
        fail(`two upstream files map to the same vendored path in ${job.spec.dir}`)
    }
    for (const file of files) {
        mkdirSync(path.dirname(job.vendoredPath(file)), { recursive: true })
        copyFileSync(file, job.vendoredPath(file))
    }
    if (job.isCommonJs) {
        writeFileSync(path.join(job.target, "upstream/package.json"), `${JSON.stringify({ type: "commonjs" }, undefined, JsonIndent)}\n`)
    }
}

interface SpecifierChange {
    from: string
    to:   string
}

// Rewrites the module specifier `from` to `to` in import/export/require statements of `source`.
function rewriteSpecifier(source: string, change: SpecifierChange): string {
    const escaped = change.from.replaceAll(/[$()*+./?[\\\]^{|}]/gu, String.raw`\$&`)
    const statement = new RegExp(`(?<keyword>\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s+|\\b(?:__)?require\\s*\\(\\s*)(?<quote>["'])${escaped}\\k<quote>`, "gu")

    return source.replaceAll(statement, `$<keyword>$<quote>${change.to}$<quote>`)
}

// The packages the copied files belong to, in the order they were found; all must be ESM.
function familyPackages(job: Job): Job["family"] {
    const packages = new Map<string, Job["family"][number]>()
    for (const file of job.closure.files) {
        const owner = packageRoot(file)
        if (owner.manifest.type !== "module" && !file.endsWith(".mjs")) {
            fail(`${owner.name} is not an ES module package; the "packages" layout copies ESM only`)
        }
        packages.set(owner.name, owner)
    }

    return [...packages.values()]
}

// The import of `resolved` from `file`, as a relative specifier between their vendored copies.
function relativeSpecifier(job: Job, { file, resolved }: { file: string, resolved: string }): string {
    const relative = path.relative(path.dirname(job.vendoredPath(file)), job.vendoredPath(resolved))

    return relative.startsWith(".") ? relative : `./${relative}`
}

// "packages" layout: the family's imports of each other become relative, and each package keeps
// its LICENSE.
function linkFamily(job: Job): Job {
    const family = familyPackages(job)
    for (const [file, resolutions] of job.closure.familyImports) {
        let source = readFileSync(job.vendoredPath(file), "utf8")
        for (const [from, resolved] of resolutions) {
            source = rewriteSpecifier(source, { from, to: relativeSpecifier(job, { file, resolved }) })
        }
        writeFileSync(job.vendoredPath(file), source)
    }
    for (const { dir, name } of family) {
        const license = licenseFile(dir)
        if (license !== undefined) {
            copyFileSync(license, path.join(job.target, name, "LICENSE"))
        }
    }

    return { ...job, family }
}

// The rules of an upstream plugin module, however it exports the plugin.
async function upstreamRules(file: string): Promise<Record<string, unknown>> {
    const pluginModule: unknown = await import(file)
    const defaultExport = field(pluginModule, "default")
    const candidates = [defaultExport, field(defaultExport, "default"), field(pluginModule, "plugin"), field(defaultExport, "plugin"), pluginModule]
    const rules = candidates.map((candidate) => field(candidate, "rules")).find((value) => isRecord(value))

    return isRecord(rules) ? rules : fail(`no plugin with rules exported by ${file}`)
}

async function pluginEntry(job: Job, pluginFile: string): Promise<EntryCode> {
    const rules = await upstreamRules(pluginFile)
    const missing = job.upstream.rules.filter((name) => rules[name] === undefined)
    if (missing.length > 0) {
        fail(`${job.spec.pkg} has no rule(s) ${missing.join(", ")}`)
    }
    const imports = [
        `import * as upstreamModule from "./${path.relative(job.target, job.vendoredPath(pluginFile))}"`,
        "",
        "const upstream = pluginOf(upstreamModule)",
        "",
        "function pluginOf(mod) {",
        "    for (const candidate of [mod.default, mod.default?.default, mod.plugin, mod.default?.plugin, mod]) {",
        "        if (candidate?.rules) {",
        "            return candidate",
        "        }",
        "    }",
        "}",
    ]

    return { entries: job.upstream.rules.map((name) => `        "${name}": upstream.rules["${name}"],`), imports }
}

function camel(name: string): string {
    return name.replaceAll(/-(?<letter>\w)/gu, (...match: unknown[]) => String(field(match.at(-1), "letter")).toUpperCase())
}

// "rule-files" layout: which export of each rule module is the rule object.
async function ruleFilesEntry(job: Job): Promise<EntryCode> {
    const code: EntryCode = { entries: [], imports: [] }
    for (const [name, file] of job.ruleFiles) {
        const ruleModule: unknown = await import(file)
        const exportNames = Object.keys(isRecord(ruleModule) ? ruleModule : {})
        const exportName = exportNames.find((key) => typeof field(field(ruleModule, key), "create") === "function") ?? fail(`no rule export in ${file}`)
        const relative = `./${path.relative(job.target, job.vendoredPath(file))}`
        code.imports.push(exportName === "default" ? `import ${camel(name)} from "${relative}"` : `import { ${exportName} as ${camel(name)} } from "${relative}"`)
        code.entries.push(`        "${name}": ${camel(name)},`)
    }

    return code
}

function applyPatches(job: Job): void {
    const { patches, pkg } = job.spec
    for (const [file, list] of Object.entries(typeof patches === "function" ? patches(job.upstream) : patches ?? {})) {
        const full = path.join(job.target, file)
        let source = readFileSync(full, "utf8")
        for (const [
            search,
            replace,
            why,
        ] of list) {
            source = source.includes(search) ? source.replace(search, replace) : fail(`${pkg}: patch for ${file} no longer applies (${why})`)
        }
        writeFileSync(full, source)
    }
}

// Imports of the helper packages bundled in vendor/_deps (deps.ts) now load those modules.
// Returns the specifiers that were rewritten.
function inlineImports(job: Job): Set<string> {
    const rewritten = new Set<string>()
    for (const file of [...job.closure.files].map((upstreamFile) => job.vendoredPath(upstreamFile))) {
        const source = readFileSync(file, "utf8")
        let result = source
        for (const [specifier, module] of Object.entries(inlinedImports)) {
            const next = rewriteSpecifier(result, { from: specifier, to: path.relative(path.dirname(file), path.join(lintDir, "vendor/_deps", module)) })
            if (next !== result) {
                rewritten.add(specifier)
            }
            result = next
        }
        if (result !== source) {
            writeFileSync(file, result)
        }
    }

    return rewritten
}

function removeEmptyDirs(dir: string): boolean {
    let isEmpty = true
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory() && removeEmptyDirs(full)) {
            rmSync(full, { recursive: true })
        } else {
            isEmpty = false
        }
    }

    return isEmpty
}

// A patch can cut an import (e.g. of a utility barrel): keep only the files the patched entry points
// still reach, so no dead code (or its dependencies) is shipped. Returns the files kept.
function prune(job: Job): Set<string> {
    const reached = new Set<string>()
    const pending = job.roots.map((file) => job.vendoredPath(file))
    for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
        if (!reached.has(file) && file.startsWith(job.target + path.sep) && existsSync(file)) {
            reached.add(file)
            pending.push(...localImports(file))
        }
    }
    const unreached = [...job.closure.files].map((file) => job.vendoredPath(file)).filter((vendored) => !reached.has(vendored))
    for (const file of unreached) {
        rmSync(file)
    }
    removeEmptyDirs(job.target)

    return reached
}

// Runtime dependencies of the vendored code as patched (Node built-ins are not dependencies).
function externalDependencies(reached: Set<string>): Set<string> {
    const specifiers = [...reached].flatMap((file) => bareImports(file)).filter((name) => !name.startsWith("node:"))
    const names = specifiers.map((specifier) => packageName(specifier))

    return new Set(names.filter((name) => !builtinModules.includes(name)))
}

interface Imports {
    // the packages the vendored files import
    external: Set<string>
    // the imports that now load a module of vendor/_deps
    inlined:  Set<string>
    // the vendored files left after pruning
    reached:  Set<string>
}

// Points imports at vendor/_deps, prunes the files the patches made unreachable, and lists the
// runtime dependencies of what's left (which must be dependencies of @deluxeowl/lint).
function resolveImports(job: Job): Imports {
    const inlined = inlineImports(job)
    const reached = prune(job)
    const external = externalDependencies(reached)
    checkDeclared(lintDir, { external, owner: `vendor/${job.spec.dir}` })

    return {
        external, inlined, reached,
    }
}

export async function vendorPlugin(spec: PluginSpec): Promise<void> {
    const staged = await stage(spec)
    copyFiles(staged)
    const job = spec.layout.kind === "packages" ? linkFamily(staged) : staged
    const entry = job.pluginFile === undefined ? await ruleFilesEntry(job) : await pluginEntry(job, job.pluginFile)
    applyPatches(job)
    const {
        external, inlined, reached,
    } = resolveImports(job)
    writeCompat(lintDir)
    writeEntry(job, entry)
    copyLicense(job)
    writeReadme(job, { external, inlined })
    const final = path.join(lintDir, "vendor", spec.dir)
    rmSync(final, { force: true, recursive: true })
    renameSync(job.target, final)
    console.log(`${spec.dir}: ${spec.pkg}@${job.manifest.version ?? "?"}, ${job.upstream.rules.length} rules, ${reached.size} files (of ${job.closure.files.size} before patches); external deps: ${external.size > 0 ? [...external].toSorted().join(", ") : "none"}${inlined.size > 0 ? `; from _deps: ${[...inlined].toSorted().join(", ")}` : ""}`)
}
