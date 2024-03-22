import React, { useEffect, useMemo, useState } from "react"
import { RunnerIframe, RunnerIframeSandboxAllow } from "./Iframe"
import { RunnerManifet } from "./manifest"
import { runnerRenderSite, RunnerSiteConfig } from "./site"

export const Runner = (props: {
    manifest: RunnerManifet
}) => {
    const [runId, setRunId] = useState<number | null>(null)
    const [url, setUrl] = useState("")
    const {
        code,
        policy
    } = props.manifest

    const siteCode = useMemo(() => {
        let siteConfig: RunnerSiteConfig = {
            inlineCode: code,
        }

        return runnerRenderSite(siteConfig)
    }, [code])

    const allows: RunnerIframeSandboxAllow[] = useMemo(() => {
        return [...policy.sandboxAllows].sort()
    }, [policy])

    useEffect(() => {
        const blob = new Blob([siteCode], {
            type: "text/html", // if you won't do that it'll work on FF, but not on chrome
        })
        const url = URL.createObjectURL(blob)
        setUrl(url)
        return () => {
            URL.revokeObjectURL(url)
        }
    }, [siteCode])

    return <div className="c-code-runner">
        <div className="c-code-runner__button-bar">
            <button
                className="c-code-runner__button"
                onClick={() => {
                    setRunId(runId ? (runId + 1) % 10000 : 1)
                }}>{runId ? "Rerun this snippet" : "Run this snippet"}</button>
            {runId ? <button onClick={() => {
                setRunId(null)
            }} className="c-code-runner__button">Close</button> : null}
        </div>
        {runId ?
            <div className="c-code-runner__iframe-parent">
                <RunnerIframe
                    className="c-code-runner__iframe"
                    siteUrl={url}
                    runId={runId}
                    sandboxAllows={allows}
                />
            </div> : null}
    </div>
}