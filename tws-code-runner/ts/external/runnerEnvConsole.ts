// quick-n-dirty console display

const old = console.log;
const logger = document.createElement("ul")
logger.className = "c-console-root"
document.body.appendChild(logger)
console.log = function (...args) {
    const element = document.createElement("li")
    const pre = document.createElement("pre")
    element.appendChild(pre)
    const code = document.createElement("code")
    code.innerText = JSON.stringify(args)
    pre.appendChild(code)
    logger.appendChild(element)

    old(...args)
}