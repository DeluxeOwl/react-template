import {
    defineConfig,
} from "eslint/config"

import createConfig from "./src/index"

export default defineConfig([
    {
        extends: [createConfig(import.meta.dirname, { allowDefaultProject: ["eslint.config.ts"] })],
    },
])
