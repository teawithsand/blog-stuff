import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const numbersTable = sqliteTable("numbers", {
    x: integer("x").notNull(),
    y: integer("y").notNull()
})