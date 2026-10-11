import path from "node:path"
import { readFileSync } from "node:fs"

import type {
    Patch, Upstream, PluginSpec,
} from "../spec.ts"

// 0.0.23 is distributed as one bundle. Its config constructors eagerly load five third-party ESLint
// plugins: keep the rule code but remove those config-only imports, and the rules we don't use.
const unusedRules = [
    ["no-useless-hook", "no_useless_hook_default"],
    ["jsx-on-handler-verb-suffix", "jsx_on_handler_verb_suffix_default"],
    ["no-external-binding-mutation", "no_external_binding_mutation_default"],
    ["jsx-compound-part-export-naming", "jsx_compound_part_export_naming_default"],
    ["no-inline-call-expressions", "no_inline_call_expressions_default"],
] as const

// Enabled upstream, but they use the type checker when available, which oxlint JS plugins don't get.
const typedRules = [
    ["no-object-props", "no_object_props_default"],
    ["no-array-props", "no_array_props_default"],
] as const
const typedWhy = "it uses the TypeScript type checker when available (imported/derived prop types), and oxlint JS plugins get no type information."

function patches(upstream: Upstream): Patch[] {
    const source = readFileSync(path.join(upstream.packageDir, "dist/index.cjs"), "utf8")
    const section = (marker: string): string => {
        const start = source.indexOf(`// src/${marker}`)

        return source.slice(start, source.indexOf("// src/", start + 1))
    }

    return [
        [
            section("configs/core.ts") + section("configs/react.ts"),
            "",
            "Remove upstream config constructors and their eager third-party ESLint plugin imports; oxlint presets supply options and settings.",
        ],
        ...unusedRules.flatMap(([name, binding]): Patch[] => [
            [section(`rules/${name}.ts`), "", `Remove ${name}, which our presets don't enable.`],
            [`    "${name}": ${binding},\n`, "", `Remove the unused ${name} registration.`],
        ]),
        ...typedRules.flatMap(([name, binding]): Patch[] => [
            [section(`rules/${name}.ts`), "", `Remove ${name}: ${typedWhy}`],
            [`    "${name}": ${binding},\n`, "", `Remove the ${name} registration.`],
        ]),
        [
            "var plugin = {\n  ...pluginBase,\n  configs: {\n    core: createCoreConfig(pluginBase),\n    react: createReactConfig(pluginBase)\n  }\n};",
            "var plugin = pluginBase;",
            "Export only rule definitions, not the deleted ESLint configs.",
        ],
    ]
}

export default {
    dir:     "sweepit",
    install: { "eslint-plugin-sweepit": "0.0.23" },
    // The CJS filename avoids a collision with the generated index.js.
    layout:  { kind: "plugin", pluginFile: "dist/index.cjs" },
    patches: (upstream) => ({ "index.cjs": patches(upstream) }),
    pkg:     "eslint-plugin-sweepit",
    prefix:  "sweepit",
} satisfies PluginSpec
