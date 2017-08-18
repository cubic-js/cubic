/**
 * Generic Dependencies
 */
const util = require("util")
const fs = require("fs")
const readFile = util.promisify(fs.readFile)
const path = require("path")


/**
 * Render Dependencies
 */
const sourcePath = blitz.config[blitz.id].sourcePath
const publicPath = blitz.config[blitz.id].publicPath
const createBundleRenderer = require("vue-server-renderer").createBundleRenderer


/**
 * View Controller rendering data into templates
 */
class ViewController {
    async render(template, data, req) {
        const serverBundle = require(path.join(publicPath, "vue-ssr-server-bundle.json"))
        const clientManifest = require(path.join(publicPath, "vue-ssr-client-manifest.json"))
        const base = await readFile(path.join(sourcePath, "index.html"))
        const renderer = createBundleRenderer(serverBundle, {
            template: base,
            clientManifest,
            runInNewContext: false
        })
        const render = util.promisify(renderer.renderToString)
        return render(data)
    }
}

module.exports = new ViewController
