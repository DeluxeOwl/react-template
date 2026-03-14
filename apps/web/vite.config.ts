// oxlint-disable-next-line import/no-nodejs-modules -- This is fine for vite.
import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import autoImport from "unplugin-auto-import/vite"

// https://vite.dev/config/
export default defineConfig({
    clearScreen: false,
    plugins:     [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler"]],
            },
        }),
        autoImport({
            dts:     "node_modules/auto-imports.d.ts",
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
