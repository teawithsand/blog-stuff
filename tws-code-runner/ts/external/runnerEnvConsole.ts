const old = console.log;
const logger = document.createElement("ul")
logger.className = "c-console-root"
document.body.appendChild(logger)

const myLog = (args: any[]) => {
    const element = document.createElement("li")
    const pre = document.createElement("pre")
    element.appendChild(pre)
    const code = document.createElement("code")
    code.innerText = JSON.stringify(args)
    pre.appendChild(code)
    logger.appendChild(element)
}

window.addEventListener("error", (ev) => {
    // log.textContent = `${log.textContent}${event.type}: ${event.message}\n`;
    const err = ev.error
    console.log("window.onerror", err.name, err.message)
})

console.log = function (...args) {
    myLog(args)
    old(...args)
}