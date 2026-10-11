import type { PluginSpec } from "../spec.ts"

export default {
    dir:     "react-refresh",
    install: { "eslint-plugin-react-refresh": "0.5.2" },
    layout:  { kind: "plugin", pluginFile: "index.js" },
    pkg:     "eslint-plugin-react-refresh",
    prefix:  "react-refresh",
} satisfies PluginSpec
