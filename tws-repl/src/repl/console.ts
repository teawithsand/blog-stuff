import { ReplEvaluation, ReplEvaluationType } from "./repl";

const oldLog = console.log;
const oldErr = console.error;

const preInitLogs: ReplEvaluation[] = []

export type LogCallback = (evaluation: ReplEvaluation) => void

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack
// this function tries to correctly parse both v8, SM and JSC representations
const parseStack = (stack: string) => {
    const lines = stack.trim().split("\n")
    return lines
        .map(l => l.trim())
        .map(l => {
            const res = l.split(":")
            if (res.length < 2) return null

            const vals = [res[res.length - 2], res[res.length - 1]].map(
                v => v.replace(/\D/, "")
            )

            return {
                line: parseInt(vals[0]),
                column: parseInt(vals[1])
            }
        }).filter(l => !!l)
}

export const startCatpure = (logCallback: LogCallback) => {
    console.log = (...args: any[]) => {
        // TODO(teawithsand): line and column number support
        // there is no good way to do that
        // we can only parse stack trace.
        const err = new Error()
        const parsed = err.stack ? parseStack(err.stack) : null
        let line: number | null = null
        let column: number | null = null

        if (parsed) {
            line = parsed[1]?.line ?? null
            column = parsed[1]?.column ?? null
        }

        logCallback({
            type: ReplEvaluationType.CONSOLE_LOG,
            result: args.length === 1 ? args[0] : args,
            line: line,
            column: column,
        })
        oldLog(...args)
    }

    (console as any).funLog = (callback: () => any) => {
        const res = callback()
        logCallback({
            type: ReplEvaluationType.CODE,
            code: callback.toString(),
            result: res,
        })
        oldLog(callback, res)
    }

    (console as any).funLogMany = (callback: () => any[]) => {
        const res = callback()
        logCallback({
            type: ReplEvaluationType.CODE,
            code: callback.toString(),
            result: res,
        })
        oldLog(callback, ...res)
    }


    console.error = (...args: any[]) => {
        logCallback({
            type: ReplEvaluationType.ERROR,
            result: args.length === 1 ? args[0] : args,
            code: "console.error",
        })
        oldErr(...args)
    }
}

export const stopCapture = () => {
    console.log = oldLog
    console.error = oldErr
}

export const captureFunction = <T>(
    callback: LogCallback,
    fun: () => T
): T => {
    startCatpure(callback)
    try {
        return fun()
    } finally {
        stopCapture()
    }
}