import config from "@react-template/eslint"
import {
    defineConfig,
} from "eslint/config"

export default defineConfig([
    {
        extends: [config(import.meta.dirname)],
    },
])
