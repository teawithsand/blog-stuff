import NativeSQLiteDB, { Database } from "better-sqlite3"
import { afterAll, afterEach, beforeEach, describe, expect, test } from "vitest"
import { ORM } from "./db"
import { MigrationManager } from "./manager"
import { GLOBAL_MIGRATIONS } from "./Drizzle"
import { numbersTable } from "./schema"
import { drizzle } from "drizzle-orm/better-sqlite3"


export const makeTestingDB = (): [() => void, ORM] => {
	const sqlite = new NativeSQLiteDB(":memory:")
    // TODO(teawithsand): if you want to have pretty orm type, 
    // I am sure you can do something like this.
	/*
    const orm = drizzle(async (sql, params, method) => {
        if(method === "run"){
            sqlite.prepare(sql).pluck(true).bind(...params).run()
            return {
                rows: []
            }
        }
        const rows = sqlite.prepare(sql).bind(...params).pluck(true).all()
        console.log({ rows })
        return { rows }
    })
    */
   // for now though, I'll just hack it to work

	return [() => sqlite.close(), drizzle(sqlite) as unknown as ORM]
}

describe("Migrations", () => {
    let closer: () => void
    let orm: ORM
    beforeEach(() => {
        [closer, orm] = makeTestingDB()
    })
    afterEach(() => {
        closer()
    })
    test("can run migrations and select from table", async () => {
        const mm = new MigrationManager(GLOBAL_MIGRATIONS, orm)
        await mm.migrateToLatest()

        await orm.select().from(numbersTable) // no error => table exists and is fine(has columns in sync with schema)

        // here is when you end your usual migrations testing
        // further code I've written as a example to prove that above code works

        await orm.insert(numbersTable).values({x: 21, y: 37})
        const results = await orm.select().from(numbersTable)

        expect(results.length).toEqual(1)
        expect(parseInt(results[0].x.toString() + results[0].y.toString())).toEqual(2137)

    })
})