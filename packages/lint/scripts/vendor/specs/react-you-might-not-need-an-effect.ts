import type { PluginSpec } from "../spec.ts"

export default {
    dir:     "react-you-might-not-need-an-effect",
    install: { "eslint-plugin-react-you-might-not-need-an-effect": "0.10.0" },
    layout:  { kind: "plugin", pluginFile: "dist/index.mjs" },
    patches: {
        "index.mjs": [
            [
                "import globals from \"globals\";",
                "",
                "Remove the globals import used only by upstream ESLint presets; the generated oxlint entry exposes rules, not those presets",
            ],
            [
                `const rules = (severity) => Object.keys(plugin.rules).reduce((acc, ruleName) => {
\tacc[plugin.meta.name + "/" + ruleName] = severity;
\treturn acc;
}, {});
const languageOptions = {
\tglobals: { ...globals.browser },
\tparserOptions: { ecmaFeatures: { jsx: true } }
};
const flatConfig = {
\tfiles: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
\tplugins: { [plugin.meta.name]: plugin },
\tlanguageOptions
};
const legacyConfig = {
\tplugins: [plugin.meta.name],
\t...languageOptions
};
Object.assign(plugin.configs, {
\trecommended: {
\t\t...flatConfig,
\t\trules: rules("warn")
\t},
\tstrict: {
\t\t...flatConfig,
\t\trules: rules("error")
\t},
\t"legacy-recommended": {
\t\t...legacyConfig,
\t\trules: rules("warn")
\t},
\t"legacy-strict": {
\t\t...legacyConfig,
\t\trules: rules("error")
\t}
});`,
                "",
                "Remove upstream flat/legacy ESLint presets, which are unused by the generated rule-only entry; preserve every rule implementation",
            ],
        ],
    },
    pkg:    "eslint-plugin-react-you-might-not-need-an-effect",
    prefix: "react-you-might-not-need-an-effect",
} satisfies PluginSpec
