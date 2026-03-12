import {
    int, text, sqliteTable,
} from "drizzle-orm/sqlite-core"

export const todosTable = sqliteTable("todo", {
    done: int({ mode: "boolean" }).notNull(),
    id:   text().primaryKey(),
    name: text().notNull(),
})
