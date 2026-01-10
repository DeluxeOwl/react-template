import {
    defineConfig,
} from "eslint/config"
import reactConfig from "@react-template/eslint/react"

export default defineConfig([
    {
        extends:  [reactConfig(import.meta.dir)],
        settings: {
            "better-tailwindcss": {
                entryPoint: "src/index.css",
            },
        },
    },
])
