import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ObjetView } from "./view"
import { startCatpure, stopCapture } from "./console"

export enum ReplEvaluationType {
    CODE = "code",
    CONSOLE_LOG = "console-log",
    ERROR = "error"
}

export type ReplEvaluation = {
    type: ReplEvaluationType.CODE | ReplEvaluationType.ERROR
    code: string,
    result: any
} | {
    type: ReplEvaluationType.CONSOLE_LOG,
    result: any,
    code?: undefined,
    line: number | null,
    column: number | null
}

type ReplHistory = {
    evaluations: ReplEvaluation[]
}


interface ReplControl {
    readonly history: ReplHistory
    evaluate: (code: string) => void
    addEvals: (values: ReplEvaluation[]) => void
}

const globalEval = (code: string) => window.eval.call(window, code)

const useReplControl = (captureLogs: boolean): ReplControl => {
    const [rawHistory, setHistory] = useState<ReplHistory | null>()

    const history = rawHistory ?? {
        evaluations: [],
    }

    return {
        history,
        addEvals: (evaluations: ReplEvaluation[]) => {
            setHistory({
                evaluations: [
                    ...history.evaluations,
                    ...evaluations,
                ]
            })
        },
        evaluate: (code: string) => {
            // can't just update history here, because it fails to mutate state during an eval
            try {
                let logs: ReplEvaluation[] = []
                if (captureLogs) {
                    startCatpure((res) => logs.push(res))
                }
                try {
                    const result = globalEval(code)
                    setHistory({
                        evaluations: [
                            ...history.evaluations,
                            ...logs,
                            {
                                type: ReplEvaluationType.CODE,
                                result,
                                code,
                            }
                        ]
                    })
                } finally {
                    stopCapture()
                }

            } catch (e) {
                setHistory({
                    evaluations: [
                        ...history.evaluations,
                        {
                            type: ReplEvaluationType.ERROR,
                            code,
                            result: e,
                        }
                    ]
                })
            }
        }
    }
}

const ReplLine = ({ entry }: { entry: ReplEvaluation }) => {
    if (entry.type === ReplEvaluationType.CODE || entry.type === ReplEvaluationType.ERROR) {
        return <li
            className="c-repl__entry">
            {entry.code ? <>
                {entry.type === ReplEvaluationType.CODE ?
                    <span className="c-repl__code-tag c-repl__code-tag--ok">{">"}</span> :
                    <span className="c-repl__code-tag c-repl__code-tag--err">!</span>
                }
                <span className="c-repl__code"><pre><code>{entry.code}</code></pre></span>
            </> : null}
            <div className="c-repl__val">
                <ObjetView value={entry.result} />
            </div>
        </li>
    } else if (entry.type === ReplEvaluationType.CONSOLE_LOG) {
        return <li
            className="c-repl__entry">
            {entry.line || entry.column ? <span className="c-repl__code-tag c-repl__code-tag--log">console.log@L{entry.line ?? "?"}C{entry.column ?? "?"}</span> : null}
            <div className="c-repl__val">
                <ObjetView value={entry.result} />
            </div>
        </li>
    } else {
        throw new Error(`Bad entry type: ${(entry as any).type}`)
    }
}

export const Repl = ({ initialEntries, global, captureLogs }: {
    initialEntries?: ReplEvaluation[],
    global?: boolean
    captureLogs?: boolean
}) => {
    const repl = useReplControl(!!captureLogs)
    const [code, setCode] = useState("")
    const [historyRef, setHistoryRef] = useState<HTMLElement>()
    const [evalNotifier, setEvalNotifier] = useState(0)

    useLayoutEffect(() => {
        if (!historyRef) return

        historyRef.scroll({
            top: historyRef.scrollHeight
        })
    }, [evalNotifier, historyRef])

    const totalEvals = [
        ...(initialEntries ?? []),
        ...repl.history.evaluations
    ]

    return <div className={`c-repl ${global ? "c-repl--global" : ""}`}>

        {totalEvals.length > 0 ? <ul
            ref={setHistoryRef as any}
            className="c-repl__history">
            {totalEvals.map((e, i) => <ReplLine entry={e} key={i} />)}
        </ul> : <span className="c-repl__no-history">Type some code to evaluate it.</span>}
        <hr className="c-repl__separator" />
        <form className="c-repl__prompt">
            <textarea
                onKeyDown={(e) => {
                    if (e.key.toLowerCase() === "enter" && !e.shiftKey) {
                        setEvalNotifier((evalNotifier + 1) % 100000)
                        e.preventDefault()
                        setCode("")
                        repl.evaluate(code.trim());
                    }
                }}

                onChange={(e) => {
                    setCode(e.target.value)
                }}
                rows={1}
                value={code}
                className="c-repl__input"
                placeholder="Type code to evaluate"></textarea>
        </form>
    </div>
}