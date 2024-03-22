import { encodeToDataUrl } from "../utils/url"
import { runnerGetAttributes } from "./attributes"
import { RunnerCode, RunnerCodeType, RunnerJSEnv, RunnerPythonEnv } from "./manifest"

// TODO(teawithand): use these types insted of strings
export type LinkedRes = {
    url: string,
    crossorigin?: boolean
    type?: string
}

export type RunnerSiteConfig = {
    inlineCode: RunnerCode
    bodyHtmlPreScripts?: string
    cssIncludes?: LinkedRes[],
    jsIncludes?: LinkedRes[],
}

export const runnerRenderSite = (config: RunnerSiteConfig): string => {
    const attributes = runnerGetAttributes()

    config = JSON.parse(JSON.stringify(config))
    let code = ""

    if (config.inlineCode.type === RunnerCodeType.JS) {
        code = `<script src="data:application/javascript;charset=utf-8;base64,${btoa(config.inlineCode.js)}"></script>`

        if (config.inlineCode.env === RunnerJSEnv.CONSOLE) {
            config.jsIncludes = [
                {
                    url: encodeToDataUrl("application/javascript", attributes.consoleJs),
                },
                ...(config.jsIncludes ?? []),
            ]
            config.cssIncludes = [
                {
                    url: encodeToDataUrl("text/css", attributes.consoleCss),
                },
                ...(config.cssIncludes ?? []),
            ]
            config.bodyHtmlPreScripts = `
            <div class="c-header">
            <h1 class="c-header__title">TWS simple code runner</h1>
            <p class="c-header__subtitle">For more info just inspect this iframe or copy+paste, then edit and run it yourself</p>
            </div>
            `
        }
    } else if (config.inlineCode.type === RunnerCodeType.HTML) {
        return config.inlineCode.html // html overrides everything. It becomes body of an iframe
    } else if (config.inlineCode.type === RunnerCodeType.PYTHON) {
        let env = ""
        if (config.inlineCode.env === RunnerPythonEnv.TERMINAL) {
            env = "terminal"
        } else if (config.inlineCode.env === RunnerPythonEnv.TERMINAL_WORKER) {
            env = "terminal worker"
        }
        config.jsIncludes = [
            {
                url: "https://pyscript.net/releases/2024.1.1/core.js",
                type: "module"
            },
            ...(config.jsIncludes ?? []),
        ]
        config.cssIncludes = [
            {
                url: "https://pyscript.net/releases/2024.1.1/core.css",
            },
            ...(config.cssIncludes ?? []),
        ]
        code = `<script type="py" ${env} src="data:text/x-python;charset=utf-8;base64,${btoa(config.inlineCode.python)}"></script>`
    }

    const kvPrint = (o: {}) => {
        const res: string[] = []
        for (const [k, v] of Object.entries(o)) {
            if (!v || !k) continue
            res.push(`${k}="${v}"`)
        }
        return res.join(" ")
    }

    const styles = (config.cssIncludes ?? []).map(link => `<link rel="stylesheet" href="${link.url}"> `).join("\n")
    const jsIncludes = (config.jsIncludes ?? []).map(link => `<script src="${link.url}" ${kvPrint({ crossorigin: link.crossorigin ? "anonymous" : undefined, type: link.type, })}></script>`).join("\n")
    return `<!DOCTYPE HTML>
    <html>
    <head>
    <meta charset="UTF-8">
    ${styles}
    </head>
    <body>
    ${config.bodyHtmlPreScripts ?? ""}
    ${jsIncludes}
    ${code}
    </body>
    </html>
    `;
}