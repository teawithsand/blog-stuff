import React, { useEffect, useState } from "react"
import { CSSProperties, useMemo } from "react"

export type RunnerIframeSandboxAllow = "no-sandbox" | "allow-same-origin" | "allow-scripts" | "allow-modals" | "allow-popups"

export const RunnerIframe = (
    {
        siteUrl: siteUrl,
        className,
        style,
        sandboxAllows,
        width,
        height,
        runId
    }: {
        siteUrl,
        className?: string,
        style?: CSSProperties,
        sandboxAllows?: RunnerIframeSandboxAllow[],
        width?: number,
        height?: number,
        runId?: string | number
    },
) => {
    const allows = useMemo(() => {
        if(sandboxAllows?.includes("no-sandbox")){
            return undefined
        }
        const res = (sandboxAllows ?? [])?.join(" ")
        return res
    }, [sandboxAllows])
    const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null)

    useEffect(() => {
        if (iframeRef) {
            iframeRef.src += ''
        }
    }, [runId ?? ""])

    useEffect(() => {
        if (!iframeRef) return
    }, [iframeRef])

    return <iframe
        ref={setIframeRef}
        width={width}
        height={height}
        className={className}
        style={style}
        sandbox={allows}
        src={siteUrl}></iframe>
}