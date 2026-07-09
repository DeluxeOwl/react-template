// oxlint-disable-next-line import/no-nodejs-modules -- This is fine for vite.
import path from "node:path"
import { defineConfig } from "vite"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import autoImport from "unplugin-auto-import/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
    clearScreen: false,
    plugins:     [
        react(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        autoImport({
            dts:     "auto-imports.d.ts",
            imports: [
                "react",
                "react-router-dom",
            ],
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "."),
        },
        tsconfigPaths: true,
    },
    server: {
        cors: true,
    },
})
