import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";

type Promiser = any // TODO(teawithsand): supply more appropriate type here

export class DBHandle {
    private isClosed = false
    constructor(
        private readonly promiser: Promiser,
        private readonly dbId: string
    ) {

    }

    runQuery = async (sql: string, bindParams?: any[]): Promise<any[]> => {
        if (this.isClosed) throw new Error(`This handle was closed!`)
        const rows: any[] = []
        await this.promiser("exec", {
            dbId: this.dbId,
            sql,
            bind: bindParams ?? [],
            callback: (result: any) => {
                console.log({ result })
                if (!result.row) {
                    return;
                }
                rows.push(result.row)
            },

        })
        return rows
    }

    close = async () => {
        await this.promiser('close', { dbId: this.dbId });
    }
}

/**
 * Small wrapper over the promiser for convenience.
 */
export class DBManager {
    private constructor(
        private readonly promiser: Promiser
    ) {
    }

    static initializeWorker = async (): Promise<DBManager> => {
        const promiser = await new Promise((resolve) => {
            const _promiser = sqlite3Worker1Promiser({
                onready: () => {
                    resolve(_promiser);
                },
            });
        });

        return new DBManager(promiser)
    }

    openDb = async (filename: string): Promise<DBHandle> => {
        const response = await this.promiser('open', {
            filename,
        });
        const { dbId } = response

        return new DBHandle(
            this.promiser,
            dbId,
        )
    }
}