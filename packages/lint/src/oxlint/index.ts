import type { OxlintConfig, OxlintOverride } from "oxlint"

import { reactConfig } from "./react.ts"
import { customConfig } from "./custom.ts"
import { vitestConfig } from "./vitest.ts"
import { unicornConfig } from "./unicorn.ts"
import { importXConfig } from "./import-x.ts"
import { vendoredRules } from "./vendored.ts"
import { stylisticConfig } from "./stylistic.ts"
import { importZodConfig } from "./import-zod.ts"
import { typeAwareConfig } from "./type-aware.ts"
import { typescriptConfig } from "./typescript.ts"
import { eslintCoreConfig } from "./eslint-core.ts"
import { reactHooksConfig } from "./react-hooks.ts"
import { eslintReactConfig } from "./eslint-react.ts"
import { reactRefreshConfig } from "./react-refresh.ts"
import { perfectionistConfig } from "./perfectionist.ts"
import { tanstackQueryConfig } from "./tanstack-query.ts"
import { unusedImportsConfig } from "./unused-imports.ts"
import { typescriptEslintConfig } from "./typescript-eslint.ts"
import { reactRenderTypesConfig } from "./react-render-types.ts"
import { sweepitConfig, sweepitReactConfig } from "./sweepit.ts"
import { youMightNotNeedAnEffectConfig } from "./you-might-not-need-an-effect.ts"
import {
    type TailwindSettings, type TailwindRestriction, createBetterTailwindcssConfig,
} from "./better-tailwindcss.ts"

export { runOxlintFix } from "./fix.ts"
export { reactConfig } from "./react.ts"
export { customConfig } from "./custom.ts"
export { vitestConfig } from "./vitest.ts"
export { unicornConfig } from "./unicorn.ts"
export { importXConfig } from "./import-x.ts"
export { stylisticConfig } from "./stylistic.ts"
export { importZodConfig } from "./import-zod.ts"
export { typeAwareConfig } from "./type-aware.ts"
export { typescriptConfig } from "./typescript.ts"
export { eslintCoreConfig } from "./eslint-core.ts"
export { reactHooksConfig } from "./react-hooks.ts"
export { eslintReactConfig } from "./eslint-react.ts"
export { reactRefreshConfig } from "./react-refresh.ts"
export { perfectionistConfig } from "./perfectionist.ts"
export { tanstackQueryConfig } from "./tanstack-query.ts"
export { unusedImportsConfig } from "./unused-imports.ts"
export { typescriptEslintConfig } from "./typescript-eslint.ts"
export { reactRenderTypesConfig } from "./react-render-types.ts"
export { sweepitConfig, sweepitReactConfig } from "./sweepit.ts"
export { defaultVendoredFiles, vendoredRules } from "./vendored.ts"
export { youMightNotNeedAnEffectConfig } from "./you-might-not-need-an-effect.ts"
export {
    smoothShadowRestrictions, type TailwindRestriction, type TailwindSettings,
} from "./better-tailwindcss.ts"

export interface OxlintConfigOptions {
    // Gitignore-style patterns appended to the preset's `ignorePatterns` (relative to the config file).
    ignorePatterns?: string[]
}

export interface OxlintReactConfigOptions extends OxlintConfigOptions {
    // Relax vendor policy for generated UI (shadcn, ReUI). Pass `defaultVendoredFiles` for the standard
    // directories. Type-safety and return-type rules stay enabled.
    vendoredFiles?:                  string[]
    // `settings["better-tailwindcss"]`, e.g. `{ cwd: import.meta.dirname, entryPoint: "index.css" }`.
    tailwindSettings?:               TailwindSettings
    // Appended to the shared better-tailwindcss/no-restricted-classes list, e.g.
    // `smoothShadowRestrictions` when the stylesheet imports `shadow-plugin`.
    additionalTailwindRestrictions?: TailwindRestriction[]
}

function unique<T>(values: T[]): T[] {
    return [...new Set(values)]
}

function mergeObjects<T extends object>(values: (T | undefined)[]): T | undefined {
    let merged: T | undefined

    for (const value of values) {
        if (value === undefined) {
            continue
        }
        merged = merged === undefined ? { ...value } : Object.assign(merged, value)
    }

    return merged
}

// Merges presets field by field. `extends` in `oxlint.config.ts` only inherits `rules`, `plugins`,
// `overrides` and categories, so presets are composed with this helper instead (D-003).
export function mergeOxlintConfigs(...configs: OxlintConfig[]): OxlintConfig {
    const merged: OxlintConfig = {
        categories:     mergeObjects(configs.map((config) => config.categories)),
        env:            mergeObjects(configs.map((config) => config.env)),
        globals:        mergeObjects(configs.map((config) => config.globals)),
        ignorePatterns: unique(configs.flatMap((config) => config.ignorePatterns ?? [])),
        jsPlugins:      unique(configs.flatMap((config) => config.jsPlugins ?? [])),
        options:        mergeObjects(configs.map((config) => config.options)),
        overrides:      configs.flatMap((config) => config.overrides ?? []),
        plugins:        unique(configs.flatMap((config) => config.plugins ?? [])),
        rules:          mergeObjects(configs.map((config) => config.rules)),
        settings:       mergeObjects(configs.map((config) => config.settings)),
    }

    return Object.fromEntries(Object.entries(merged).filter(([, value]) => value !== undefined)) satisfies OxlintConfig
}

export function createOxlintConfig(options?: OxlintConfigOptions): OxlintConfig {
    return mergeOxlintConfigs(
        typescriptConfig,
        typescriptEslintConfig,
        eslintCoreConfig,
        importXConfig,
        importZodConfig,
        unusedImportsConfig,
        customConfig,
        stylisticConfig,
        perfectionistConfig,
        typeAwareConfig,
        sweepitConfig,
        unicornConfig,
        vitestConfig,
        { ignorePatterns: options?.ignorePatterns ?? [] },
    )
}

export function createOxlintReactConfig(options?: OxlintReactConfigOptions): OxlintConfig {
    const vendoredFiles = options?.vendoredFiles ?? []
    const vendored: OxlintOverride[] = vendoredFiles.length === 0 ? [] : [{ files: vendoredFiles, rules: vendoredRules }]

    return mergeOxlintConfigs(
        typescriptConfig,
        typescriptEslintConfig,
        eslintCoreConfig,
        importXConfig,
        importZodConfig,
        unusedImportsConfig,
        customConfig,
        reactConfig,
        stylisticConfig,
        perfectionistConfig,
        typeAwareConfig,
        sweepitConfig,
        sweepitReactConfig,
        unicornConfig,
        vitestConfig,
        tanstackQueryConfig,
        youMightNotNeedAnEffectConfig,
        reactRefreshConfig,
        reactRenderTypesConfig,
        reactHooksConfig,
        eslintReactConfig,
        createBetterTailwindcssConfig(options?.additionalTailwindRestrictions ?? [], options?.tailwindSettings),
        { ignorePatterns: options?.ignorePatterns ?? [], overrides: vendored },
    )
}
