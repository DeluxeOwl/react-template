import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import autoImport from "unplugin-auto-import/vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        // No need to manually add the resolve path.
        tsconfigPaths(),
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
})
