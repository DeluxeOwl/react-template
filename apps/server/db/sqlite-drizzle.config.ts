
import { defineConfig } from "drizzle-kit"

export default defineConfig({
    dbCredentials: {
        url: "file.db",
    },
    dialect: "sqlite",
    out:     "./db/sqlite-drizzle",
    schema:  "./db/sqlite-schema.ts",
})
