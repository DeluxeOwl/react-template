import type { OxlintConfig, OxlintOverride } from "oxlint"

import path from "node:path"
import { existsSync, readFileSync } from "node:fs"

import type { PluginSpec } from "./spec.ts"

import { fail } from "./fail.ts"
import {
    defaultVendoredFiles, createOxlintReactConfig, smoothShadowRestrictions,
} from "../../src/oxlint/index.ts"

type ConfigPart = OxlintConfig | OxlintOverride

const lintDir = path.resolve(import.meta.dirname, "../..")

// The React preset with every option set: it includes everything the base preset has.
function presetParts(): ConfigPart[] {
    const config = createOxlintReactConfig({
        additionalTailwindRestrictions: smoothShadowRestrictions,
        vendoredFiles:                  defaultVendoredFiles,
    })

    return [config, ...config.overrides ?? []]
}

// The name the presets give the JS plugin in vendor/<dir> (e.g. "vitest-js" for vitest).
function aliasOf(dir: string, parts: ConfigPart[]): string {
    const entry = `/vendor/${dir}/index.js`
    const plugins = parts.flatMap((part) => part.jsPlugins ?? [])
    const plugin = plugins.find((candidate) => typeof candidate !== "string" && candidate.specifier.endsWith(entry))

    return typeof plugin === "object" ? plugin.name : fail(`no preset loads packages/lint/vendor/${dir}`)
}

const offSeverities = new Set<unknown>([0, "off", "allow"])

function isOn(value: unknown): boolean {
    const severity: unknown = Array.isArray(value) ? value[0] : value

    return !offSeverities.has(severity)
}

// The plugin's rules the presets configure (rule name → on in some config), in preset order.
function configuredRules(alias: string, parts: ConfigPart[]): Map<string, boolean> {
    const configured = new Map<string, boolean>()
    for (const [id, value] of parts.flatMap((part) => Object.entries(part.rules ?? {}))) {
        if (id.startsWith(`${alias}/`)) {
            const name = id.slice(alias.length + 1)
            configured.set(name, configured.get(name) === true || isOn(value))
        }
    }

    return configured
}

// The rules the committed vendor/<dir>/index.js registers, in its order.
function vendoredRules(dir: string): string[] {
    const entry = path.join(lintDir, "vendor", dir, "index.js")
    const source = existsSync(entry) ? readFileSync(entry, "utf8") : ""

    return [...source.matchAll(/^ {8}"(?<name>[^"]+)": /gmu)].map((match) => match.groups?.name ?? "")
}

// The rules to vendor: those already vendored that a preset still configures, in their order (it
// decides which of two fixes for the same range wins), then the ones a preset turns on that are not
// vendored yet. A rule no preset configures any more is dropped.
export function selectRules(spec: PluginSpec): string[] {
    const parts = presetParts()
    const configured = configuredRules(aliasOf(spec.dir, parts), parts)
    const kept = vendoredRules(spec.dir).filter((name) => configured.has(name))
    const added = [...configured].filter(([name, on]) => on && !kept.includes(name)).map(([name]) => name)
    const dropped = vendoredRules(spec.dir).filter((name) => !configured.has(name))
    for (const [label, names] of [["added", added], ["dropped", dropped]] as const) {
        if (names.length > 0) {
            console.log(`${spec.dir}: ${label} ${names.join(", ")}`)
        }
    }

    return [...kept, ...added]
}
