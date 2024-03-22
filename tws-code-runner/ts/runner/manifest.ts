import { RunnerIframeSandboxAllow } from "./Iframe"

export type RunnerPolicy = {
    sandboxAllows: Set<RunnerIframeSandboxAllow>
}

export enum RunnerJSEnv {
    RAW = "raw",
    CONSOLE = "console",
}

export enum RunnerPythonEnv {
    RAW = "raw",
    TERMINAL = "terminal",
    TERMINAL_WORKER = "terminal-worker"
}

export enum RunnerCodeType {
    JS = "js",
    HTML = "html",
    PYTHON = "python"
}

export type RunnerCode = {
    type: RunnerCodeType.JS
    js: string
    env: RunnerJSEnv
} | {
    type: RunnerCodeType.HTML,
    html: string
} | {
    type: RunnerCodeType.PYTHON,
    python: string
    env: RunnerPythonEnv,
}

export enum RunnerRuntime {
    NONE = "none",
    CONSOLE_DISPLAY = "console"
}

export type RunnerManifet = {
    code: RunnerCode,
    policy: RunnerPolicy,
}