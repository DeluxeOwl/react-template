import type { Closure } from "./closure.ts"
import type { Upstream, PluginSpec } from "./spec.ts"
import type { Manifest, PackageRoot } from "./manifest.ts"

// One spec's vendoring run once its upstream files are known and copied to the staging directory.
export interface Job {
    // vendor/<dir>.staging: generated next to the old copy and swapped in at the end
    target:       string
    closure:      Closure
    // CommonJS upstream files go to upstream/, which gets a package.json saying so
    isCommonJs:   boolean
    // the package.json of `spec.pkg`
    manifest:     Manifest
    // the upstream entry files: the plugin file or the rule files, plus `additionalFiles`
    roots:        string[]
    upstream:     Upstream
    spec:         PluginSpec
    // "packages" layout: the copied packages, in the order their files were found
    family:       PackageRoot[]
    pluginFile:   string | undefined
    ruleFiles:    Map<string, string>
    vendoredPath: (file: string) => string
}

// The generated code that registers the rules in index.js.
export interface EntryCode {
    entries: string[]
    imports: string[]
}
