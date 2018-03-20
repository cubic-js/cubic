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
const Blitz = require('blitz-js-query')
const api = new Blitz({
  api_url: blitz.config.view.client.apiUrl,
  auth_url: blitz.config.view.client.authUrl,
  user_key: blitz.config.view.core.userKey,
  user_secret: blitz.config.view.core.userSecret
})

/**
 * Render Dependencies
 */
const sourcePath = blitz.config.view.sourcePath
const publicPath = blitz.config.view.core.publicPath
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
    const template = await readFile(path.join(__dirname, "../vue/index.template.html"), "utf-8")
    const renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest,
      runInNewContext: false
    })
    const context = {
      url,
      data,
      api
    }

    // Inject vue-meta head and return rendered html
    return new Promise((resolve, reject) => {
      renderer.renderToString(context, (error, html) => {
        if (error) return reject(error.stack)
        const bodyOpt = { body: true }
        const {
          title, htmlAttrs, bodyAttrs, link, style, script, noscript, meta
        } = context.meta.inject()
        resolve(`
          <!doctype html>
          <html data-vue-meta-server-rendered ${htmlAttrs.text()}>
            <head>
              ${meta.text()}
              ${title.text()}
              ${link.text()}
              ${style.text()}
              ${script.text()}
              ${noscript.text()}
            </head>
            <body ${bodyAttrs.text()}>
              ${html}
              <script src="/assets/vendor.bundle.js"></script>
              <script src="/assets/client.bundle.js"></script>
              ${script.text(bodyOpt)}
            </body>
          </html>
        `)
      })
    })
  }
}

module.exports = new ViewController
