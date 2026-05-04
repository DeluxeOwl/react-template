import {
    int, text, sqliteTable,
} from "drizzle-orm/sqlite-core"

export const todosTable = sqliteTable("todo", {
    done:     int({ mode: "boolean" }).notNull(),
    id:       int().primaryKey({ autoIncrement: true }),
    name:     text().notNull(),
    publicId: text("public_id").notNull()
        .unique(),
})
