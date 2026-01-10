import {
    defineConfig,
} from "eslint/config"
import defaultEslintConfig from "@react-template/eslint"

export default defineConfig([
    {
        extends: [defaultEslintConfig(import.meta.dir)],
    },
])
