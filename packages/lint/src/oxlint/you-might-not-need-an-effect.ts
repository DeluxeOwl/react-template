import type { OxlintConfig } from "oxlint"

import { fileURLToPath } from "node:url"

// eslint-plugin-react-you-might-not-need-an-effect rules run by oxlint from our vendored copy of the
// plugin 0.10.0 (packages/lint/vendor/react-you-might-not-need-an-effect, generated — see its
// README). oxlint has no native versions. Severities are exactly what the ESLint preset
// (`recommended`) resolved to; parity with ESLint is recorded in scratch/oxlint-migration.md.
const youMightNotNeedAnEffectPlugin = fileURLToPath(new URL("../../vendor/react-you-might-not-need-an-effect/index.js", import.meta.url))

export const youMightNotNeedAnEffectConfig = {
    jsPlugins: [
        {
            name:      "react-you-might-not-need-an-effect",
            specifier: youMightNotNeedAnEffectPlugin,
        },
    ],
    rules: {
        "react-you-might-not-need-an-effect/no-adjust-state-on-prop-change":    ["warn"],
        "react-you-might-not-need-an-effect/no-chain-state-updates":            ["warn"],
        "react-you-might-not-need-an-effect/no-derived-state":                  ["warn"],
        "react-you-might-not-need-an-effect/no-event-handler":                  ["warn"],
        "react-you-might-not-need-an-effect/no-initialize-state":               ["warn"],
        "react-you-might-not-need-an-effect/no-pass-data-to-parent":            ["warn"],
        "react-you-might-not-need-an-effect/no-pass-live-state-to-parent":      ["warn"],
        "react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change": ["warn"],
    },
} satisfies OxlintConfig
