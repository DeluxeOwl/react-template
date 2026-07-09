import reactConfig from "@deluxeowl/lint/react"
import {
    defineConfig,
} from "eslint/config"

export default defineConfig([
    {
        extends:  [reactConfig(import.meta.dirname)],
        settings: {
            "better-tailwindcss": {
                entryPoint: "src/index.css",
            },
        },
    },
])
