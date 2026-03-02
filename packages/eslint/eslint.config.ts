import {
    defineConfig,
} from "eslint/config"

import createConfig from "./index"

export default defineConfig([
    {
        extends: [createConfig(import.meta.dirname)],
    },
])
