import { ReactElement, ReactNode, useEffect, useState } from "react"
import { DBHandle, DBManager } from "./db"

const init = async () => {
    const manager = await DBManager.initializeWorker()
    return manager
}

const initPromise = init()

export const Shell = () => {
    const [db, setDb] = useState<DBHandle | null>(null)
    const [err, setErr] = useState<any | null>(null)
    const [query, setQuery] = useState<string>("")
    const [executing, setExecuting] = useState<boolean>(false)
    const [results, setResults] = useState<any[]>([])
    useEffect(() => {
        (async () => {
            try {
                const manager = await initPromise
                const db = await manager.openDb(`file:worker-promiser.sqlite3?vfs=opfs`)
                setDb(db)
            } catch (e) {
                setErr(err)
                console.error("DB init filed!", err)
            }
        })();
    }, [])

    if (err) {
        return <h3>
            Got error while initializing db: {err};
            for more info see console
        </h3>
    }

    if (!db) return <h3>Initializing...</h3>

    if (executing) return <div>
        <h3>Executing query: </h3>
        <pre><code>
            {query}
        </code></pre>
    </div>
    const execute = async () => {
        if (!db) return
        // TODO(teawithsand): param binding support, though it seems kind of useless here
        setResults(await db.runQuery(query, []))
    }

    let resultsDisplay: ReactNode = null

    if (results.length > 0) {
        resultsDisplay = <ol>
            {results.map((r, i) => <li key={i}>{r instanceof Array ? r.join(' | ') : r?.toString()}</li>)}
        </ol>
    }

    return <div>
        <h1>SQLite shell</h1>
        <form onSubmit={(e) => {
            setExecuting(true)
            execute()
                .finally(() => {
                    setExecuting(false)
                })
            e.preventDefault()
            return false
        }}>
            <div style={{
                marginBottom: "2em",
            }}>
                <textarea
                    cols={100}
                    rows={20}
                    onChange={(e) => {
                        setQuery(e.target.value)
                    }}
                    placeholder="Type query here"></textarea>
            </div>
            <div>
                <input type="submit" value="Run query" />
            </div>
        </form>
        <h3>Query results ({results.length})</h3>
        <div>
            {resultsDisplay}
        </div>
    </div>
}