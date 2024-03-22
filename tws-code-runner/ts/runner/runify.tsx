import React, { IframeHTMLAttributes } from "react"
import ReactDOM from 'react-dom/client'
import { Runner } from "./runner"
import { RunnerCode, RunnerCodeType, RunnerJSEnv, RunnerManifet } from "./manifest"
import { runnerLoadAttribs } from "./attributes"
import { RunnerIframeSandboxAllow } from "./Iframe"

const renderRunnerFraments = async () => {
    await runnerLoadAttribs()

    const highlights = document.querySelectorAll(".c-article .highlight")
    for (const highlight of highlights) {
        const runnerEnvironment = highlight.attributes.getNamedItem("data-runner-env")?.textContent ?? ""
        const runnerAllows = highlight.attributes.getNamedItem("data-runner-allows")?.textContent ?? ""
        const js = highlight.querySelector(".language-javascript")
        const html = highlight.querySelector(".language-html")
        const python = highlight.querySelector(".language-python")

        if (!js && !html && !python) continue
        const jsCode = (js?.textContent ?? "").trim()
        const htmlCode = (html?.textContent ?? "").trim()
        const pythonCode = (python?.textContent ?? "").trim()

        const parent = highlight.parentNode
        if (!parent) continue

        const element = document.createElement("div")
        if (highlight.nextSibling) {
            parent.insertBefore(element, highlight.nextSibling)
        } else {
            parent.appendChild(element)
        }
        if (!runnerEnvironment) continue

        let code: RunnerCode
        if (jsCode) {
            code = {
                type: RunnerCodeType.JS,
                js: jsCode,
                env: runnerEnvironment as any,
            }
        } else if (htmlCode) {
            code = {
                type: RunnerCodeType.HTML,
                html: htmlCode,
            }
        } else if (pythonCode) {
            code = {
                type: RunnerCodeType.PYTHON,
                python: pythonCode,
                env: runnerEnvironment as any,
            }
        } else {
            console.error("Unreachable code!")
            continue
        }

        const allows: Set<RunnerIframeSandboxAllow> = new Set(runnerAllows.split(" ")) as Set<RunnerIframeSandboxAllow>
        allows.add("allow-scripts")
        allows.delete("" as any)

        const manifest: RunnerManifet = {
            code,
            policy: {
                sandboxAllows: allows,
            }
        }

        ReactDOM.createRoot(element).render(
            <React.StrictMode>
                <Runner manifest={manifest} />
            </React.StrictMode>,
        )
    }
}

export const initRunner = () => {
    window.addEventListener("DOMContentLoaded", () => {
        renderRunnerFraments()
    })
}