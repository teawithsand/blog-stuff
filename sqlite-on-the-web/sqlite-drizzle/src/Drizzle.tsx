import { useEffect, useState } from "react"
import { DBHandle, DBManager } from "./db"
import { Migration, MigrationManager } from "./manager"
import { sql } from "drizzle-orm"
import { numbersTable } from "./schema"

const init = async () => {
    const manager = await DBManager.initializeWorker()
    return manager
}

export const GLOBAL_MIGRATIONS: Migration[] = [
    {
        id: "v-1",
        // COPIED FROM DRIZZLE-GENERATED MIGRATION FILES
        up: sql`
            CREATE TABLE \`numbers\` (
                \`x\` integer NOT NULL,
                \`y\` integer NOT NULL
            );
        `,
        down: sql`
            NIY LOL NIY
        `,
    }
]

export const Drizzle = () => {
    const [db, setDb] = useState<DBHandle | null>(null)
    const [err, setErr] = useState<any | null>(null)
    useEffect(() => {
        (async () => {
            try {
                const manager = await init()
                const db = await manager.openDb(`file:sqlite-example-drizzle.sqlite3?vfs=opfs`)
                setDb(db)
            } catch (e) {
                setErr(err)
                console.error("DB init filed!", err)
            }
        })();
    }, [])
    useEffect(() => {
        if(!db) return
        (async () => {
            const orm = db.makeDrizzle()
            const mm = new MigrationManager(GLOBAL_MIGRATIONS, orm)
            await mm.migrateToLatest()

            await orm.insert(numbersTable).values({
                x: 1,
                y: 2,
            })

            console.log("SELECT RESULT", await orm.select().from(numbersTable).orderBy(numbersTable.x))
        })()
    }, [db])
    return <h1>
        All the magic is in console.
        <br />
        Better take a look at sources for this code.
    </h1>
}