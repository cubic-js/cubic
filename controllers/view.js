/**
 * Generic Dependencies
 */
const util = require("util")
const fs = require("fs")
const readFile = util.promisify(fs.readFile)
const path = require("path")

/** Load API node connection which will be used for server-side data-fetching
 * Without this, we'd have to create a new instance on every request
 */
const Blitz = require('blitz-js-query')
const api = new Blitz({
  user_key: blitz.config[blitz.id].user_key,
  user_secret: blitz.config[blitz.id].user_secret
})

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
  /**
   * Render View with data from Endpoint. Returns the html back to the endpoint
   */
  async render(url, data) {
    const serverBundle = require(path.join(publicPath, "vue-ssr-server-bundle.json"))
    const clientManifest = require(path.join(publicPath, "vue-ssr-client-manifest.json"))
    const template = await readFile(path.join(__dirname, "../view/src/index.template.html"), "utf-8")
    const renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest,
      basedir: path.join(blitz.config[blitz.id].sourcePath, "../../"),
      runInNewContext: false
    })
    const render = util.promisify(renderer.renderToString)
    const context = {
      url,
      data,
      api
    }
    return render(context)
  }
}

module.exports = new ViewController
