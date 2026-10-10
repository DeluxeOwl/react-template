import {
    defineConfig,
} from "eslint/config"

import createConfig from "./src/index"

export default defineConfig([
    {
        // Vendored third-party rule code (generated, see vendor/*/README.md).
        ignores: ["vendor/**"],
    },
    {
        extends: [createConfig(import.meta.dirname, { allowDefaultProject: ["eslint.config.ts", "oxlint.config.ts", "bin/*.js"] })],
    },
])
