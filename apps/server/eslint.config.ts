import config from "@deluxeowl/lint"
import {
    defineConfig,
} from "eslint/config"

export default defineConfig([
    {
        extends: [config(import.meta.dirname)],
    },
])
