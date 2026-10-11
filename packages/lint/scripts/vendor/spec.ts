// What vendor.ts needs to know about one upstream ESLint plugin; specs/<dir>.ts exports one.

// [search, replace, why]: applied in order to a vendored file after copying; `why` goes in its README.
export type Patch = [search: string, replace: string, why: string]

// vendored file (relative to vendor/<dir>) → its patches
export type Patches = Record<string, Patch[]>

// The installed upstream packages, as specs see them.
export interface Upstream {
    // the directory the spec's `install` packages were installed in (node_modules/ is inside)
    installDir: string
    // the directory of `pkg`
    packageDir: string
    // the rules to vendor, in the order index.js registers them
    rules:      string[]
}

// How the upstream package ships its rules:
// - "rule-files": one module per rule (`ruleFile(name)`, relative to the package root; its export
//   with a create() is the rule). Only the selected rules and their imports are copied.
// - "plugin":     one module exporting the plugin (`pluginFile`); the selected rules are picked from
//   plugin.rules. Its whole import closure is copied.
// - "packages":   like "plugin", for a plugin spread over several packages of one family
//   (`family(name)` is true for them): each is copied to vendor/<dir>/<package name>/, and the
//   imports between them are rewritten to relative paths, so they are not runtime dependencies.
// - "bundle":     like "plugin", for a plugin file that `build()` makes first (bundling upstream
//   code); it returns the file's absolute path.
interface BundleLayout {
    kind:  "bundle"
    build: (upstream: Upstream) => Promise<string>
}

interface PackagesLayout {
    pluginFile: string
    kind:       "packages"
    family:     (name: string) => boolean
}

interface PluginLayout {
    pluginFile: string
    kind:       "plugin"
}

interface RuleFilesLayout {
    kind:     "rule-files"
    ruleFile: (name: string) => string
}

export type Layout = BundleLayout | PackagesLayout | PluginLayout | RuleFilesLayout

// oxlint-disable-next-line custom/prefer-discriminated-union -- `layout` is the discriminated union; the optional fields apply to every layout
export interface PluginSpec {
    // packages/lint/vendor/<dir>
    dir:              string
    layout:           Layout
    // the plugin's npm package
    pkg:              string
    // the plugin's rule prefix upstream, e.g. "@stylistic" ("" for ESLint's own rules)
    prefix:           string
    // files (relative to the package root) the plugin loads by a computed path, e.g. worker modules:
    // the import scanner can't see them. They are copied with their imports and kept like entry points.
    additionalFiles?: string[]
    // the packages (exact versions) installed to vendor from; includes `pkg`
    install:          Record<string, string>
    patches?:         ((upstream: Upstream) => Patches) | Patches
}
