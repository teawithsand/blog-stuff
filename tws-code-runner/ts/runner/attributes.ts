type JSRunnerAttributes = {
    consoleJs: string,
    consoleCss: string

    pyscriptJs: string
    pyscriptCss: string
}

let attributes: JSRunnerAttributes | null = null
export const runnerGetAttributes = () => {
    if(!attributes) throw new Error(`No attributes!`)
    return attributes
}

export const runnerReadRawAttribs = () => {
    return JSON.parse((document.getElementById("tws-runner-attributes") as HTMLInputElement)?.value)
}

export const runnerLoadAttribs = async () => {
    attributes = {
        consoleCss: "",
        consoleJs: "",
        pyscriptCss: "",
        pyscriptJs: ""
    }

    {
        const raw = runnerReadRawAttribs()
        const res = await fetch(raw.runnerEnvConsoleJsPath, {
            mode: "same-origin"
        })
        const text = await res.text()
        attributes.consoleJs = text
    }
    {
        const raw = runnerReadRawAttribs()
        const res = await fetch(raw.runnerEnvConsoleCssPath, {
            mode: "same-origin"
        })
        const text = await res.text()
        attributes.consoleCss = text
    }



    {
        const raw = runnerReadRawAttribs()
        const res = await fetch(raw.runnerEnvPyscriptJsPath, {
            mode: "same-origin"
        })
        const text = await res.text()
        attributes.pyscriptJs = text
    }

    {
        const raw = runnerReadRawAttribs()
        const res = await fetch(raw.runnerEnvPyscriptCssPath, {
            mode: "same-origin"
        })
        const text = await res.text()
        attributes.pyscriptCss = text
    }

    return attributes
}