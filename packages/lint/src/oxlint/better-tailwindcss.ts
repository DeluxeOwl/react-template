import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// eslint-plugin-better-tailwindcss 4.5.0, run by oxlint from our vendored copy
// (packages/lint/vendor/better-tailwindcss, generated — see its README). These are the rules of its
// `stylistic-warn` and `correctness-error` configs, with our options, except
// `enforce-canonical-classes`: Tailwind's canonical form of a class depends on the classes compiled
// before it in the same process, and oxlint lints files in parallel, in a new process each fix round,
// so its fixes would differ from ESLint's. That rule stays in ESLint. Parity with ESLint is recorded
// in scratch/oxlint-migration.md.
const betterTailwindcssPlugin = fileURLToPath(new URL("../../vendor/better-tailwindcss/index.js", import.meta.url))

// `settings["better-tailwindcss"]` (see the plugin's docs for the rest). `entryPoint`, the CSS file
// that imports Tailwind, resolves from `cwd`. Pass `cwd: import.meta.dirname`: oxlint's working
// directory is wherever it was started, which in an editor can be the repository root.
export interface TailwindSettings {
    cwd?:              string
    entryPoint?:       string
    [setting: string]: unknown
}

export interface TailwindRestriction {
    fix?:     string
    message?: string
    pattern:  string
}

const sharedRestrictions: TailwindRestriction[] = [
    {
        message: "Restricted hardcoded color. Define a css variable instead.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?(text|bg)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-([0-9])*(\\/[0-9]{1,3})?$",
    },
    // 1. Spacing (Padding/Margin) & Border/Rounded Left -> Start
    {
        fix:     "$1$2s$3",
        message: "Use logical 'start' (-s) instead of 'left' (-l) for RTL support.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?(p|m|border-|rounded-)l([-|\\d|px|\\[].*)$",
    },
    // 2. Spacing (Padding/Margin) & Border/Rounded Right -> End
    {
        fix:     "$1$2e$3",
        message: "Use logical 'end' (-e) instead of 'right' (-r) for RTL support.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?(p|m|border-|rounded-)r([-|\\d|px|\\[].*)$",
    },
    // 3. Inset Left -> Start
    {
        fix:     "$1start$2",
        message: "Use 'start' instead of 'left' for RTL support.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?left([-|\\d|px|\\[].*)$",
    },
    // 4. Inset Right -> End
    {
        fix:     "$1end$2",
        message: "Use 'end' instead of 'right' for RTL support.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?right([-|\\d|px|\\[].*)$",
    },
    // 5. Text Align Left -> Start
    {
        fix:     "$1text-start",
        message: "Use 'text-start' instead of 'text-left'.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?text-left$",
    },
    // 6. Text Align Right -> End
    {
        fix:     "$1text-end",
        message: "Use 'text-end' instead of 'text-right'.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?text-right$",
    },
    // 7. Space utilities cause layout issues. Use gap utilities instead.
    {
        message: "Use flex and 'gap' instead of 'space-' utilities.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?space-",
    },
    // 8. Divide utilities can cause layout issues. Use gap with borders instead.
    {
        message: "Use 'gap' with border styling instead of 'divide-' utilities.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?divide-",
    },
    // 9. Float utilities are outdated. Use flexbox or grid instead.
    {
        message: "Use flexbox or grid instead of 'float-' utilities.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?float-",
    },
]

// Opt in only when the stylesheet imports `shadow-plugin`. Color utilities remain valid.
export const smoothShadowRestrictions: TailwindRestriction[] = [
    {
        fix:     "$1smooth-shadow$2",
        message: "Use the smooth-shadow scale (smooth-shadow-ring-* on elevated surfaces) instead of Tailwind's default shadows.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?shadow(-(?:xs|sm|md|lg|xl|2xl|none))?$",
    },
    {
        message: "No smooth-shadow-2xs exists. Use 'smooth-shadow-xs' or no shadow at all.",
        pattern: "^([a-zA-Z0-9:/_-]*:)?shadow-2xs$",
    },
]

export function createBetterTailwindcssConfig(additionalRestrictions: TailwindRestriction[], settings?: TailwindSettings): OxlintConfig {
    return {
        ...settings === undefined ? {} : { settings: { "better-tailwindcss": settings } },
        jsPlugins: [
            {
                name:      "better-tailwindcss",
                specifier: betterTailwindcssPlugin,
            },
        ],
        rules: {
            "better-tailwindcss/enforce-consistent-class-order":   ["warn"],
            "better-tailwindcss/enforce-consistent-line-wrapping": [
                "error",
                {
                    group:      "newLine",
                    printWidth: 120,
                },
            ],
            "better-tailwindcss/no-conflicting-classes": ["error"],
            "better-tailwindcss/no-deprecated-classes":  ["warn"],
            "better-tailwindcss/no-duplicate-classes":   ["warn"],
            // See https://github.com/schoero/eslint-plugin-better-tailwindcss/issues/267
            "better-tailwindcss/no-restricted-classes":  [
                "warn",
                {
                    // Rule options replace arrays. Append here to retain the shared restrictions.
                    restrict: [...sharedRestrictions, ...additionalRestrictions],
                },
            ],
            "better-tailwindcss/no-unknown-classes":        ["error"],
            "better-tailwindcss/no-unnecessary-whitespace": ["warn"],
        },
    }
}
