import { sql, SQLWrapper } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

import { ORM } from "./db"

export type Migration = {
    id: string
    up: SQLWrapper
    down: SQLWrapper
}

const migrationsTable = sqliteTable("migration_info", {
    id: text("id").primaryKey(),
    timestamp: integer("timestamp").notNull(),
})

export class MigrationManager {
    constructor(
        private readonly migrations: Readonly<Migration[]>,
        private readonly orm: ORM,
    ) {
        const s = new Set()
        for (const m of migrations) {
            if (s.has(m.id))
                throw new Error(`Migration id ${m.id} is not unique`)
            s.add(m.id)
        }
    }

    getMigrationIds = async (): Promise<string[]> => {
        const initMigration = sql`
        CREATE TABLE IF NOT EXISTS migration_info(
            id TEXT PRIMARY KEY NOT NULL,
            timestamp INTEGER NOT NULL
        );
    `

        await this.orm.run(initMigration)

        return (await this.orm.select().from(migrationsTable)).map(r => r.id)
    }

    migrateToLatest = async (): Promise<void> => {
        const initMigration = sql`
            CREATE TABLE IF NOT EXISTS migration_info(
                id TEXT PRIMARY KEY NOT NULL,
                timestamp INTEGER NOT NULL
            );
        `

        await this.orm.run(initMigration)

        const performedMigrations = await this.orm
            .select()
            .from(migrationsTable)
        for (const migration of this.migrations) {
            if (
                performedMigrations.some(
                    performedMigration =>
                        performedMigration.id === migration.id,
                )
            ) {
                continue
            }
            await this.orm.run(migration.up)
            await this.orm.run(
                sql`INSERT INTO migration_info(id, timestamp) VALUES (${migration.id}, ${(new Date).getTime()})`,
            )
        }
    }
}
