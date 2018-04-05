/**
 * Generic Dependencies
 */
const util = require("util")
const fs = require("fs")
const readFile = util.promisify(fs.readFile)
const path = require("path")

/**
 * Load API node connection which will be used for server-side data-fetching
 * Without this, we'd have to create a new instance on every request
 */
const Client = require('cubic-client')
const api = new Client({
  api_url: cubic.config.view.client.apiUrl,
  auth_url: cubic.config.view.client.authUrl,
  user_key: cubic.config.view.core.userKey,
  user_secret: cubic.config.view.core.userSecret
})

/**
 * Render Dependencies
 */
const sourcePath = cubic.config.view.sourcePath
const publicPath = cubic.config.view.core.publicPath
const createBundleRenderer = require("vue-server-renderer").createBundleRenderer

/**
 * View Controller rendering data into templates
 */
class ViewController {
  /**
   * Render View with data from Endpoint. Returns the html back to the endpoint
   */
  async render(req) {
    const serverBundle = require(path.join(publicPath, "vue-ssr-server-bundle.json"))
    const clientManifest = require(path.join(publicPath, "vue-ssr-client-manifest.json"))
    const template = await readFile(path.join(__dirname, "../vue/index.template.html"), "utf-8")
    const renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest,
      runInNewContext: false
    })
    const render = util.promisify(renderer.renderToString)
    const context = { req, api }
    return await render(context)
  }
}

module.exports = new ViewController