/* eslint-disable vitest/require-hook */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { migrate } from "drizzle-orm/libsql/migrator"
import { runRepositoryTests } from "@react-template/domain/todos/todo-repository.test"

import { TodoRepositorySqlite } from "./adapter-repo-sqlite"

const migrationsFolder = path.resolve(import.meta.dirname, "../db/sqlite-drizzle")

runRepositoryTests({
    name:                "TodoRepositorySqlite",
    setupTodoRepository: async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "todo-repo-test-"))
        const dbPath = path.join(tmpDir, "test.db")
        const client = createClient({ url: `file:${dbPath}` })
        const db = drizzle(client)

        await migrate(db, { migrationsFolder })

        return {
            cleanup: () => {
                client.close()
                fs.rmSync(tmpDir, { force: true, recursive: true })
            },
            repository: TodoRepositorySqlite.create(client),
        }
    },
})
