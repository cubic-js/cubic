/**
 * Generic Dependencies
 */
const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const path = require('path')

/**
 * Load API node connection which will be used for server-side data-fetching
 * Without this, we'd have to create a new instance on every request
 */
const Client = require('cubic-client')
const api = new Client({
  api_url: cubic.config.ui.client.apiUrl,
  auth_url: cubic.config.ui.client.authUrl,
  user_key: cubic.config.ui.core.userKey,
  user_secret: cubic.config.ui.core.userSecret
})

/**
 * Render Dependencies
 */
const publicPath = cubic.config.ui.core.publicPath
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer

/**
 * Helper function to wait until webpack bundle has generated files
 */
const { promisify } = require('util')
const fileExists = promisify(fs.lstat)

// one-time check, so we wouldn't read from disk on every request
let bundlesReady = false

async function awaitBundles () {
  return new Promise(async resolve => {
    try {
      const path = require(cubic.config.ui.webpack.clientConfig).output.path
      await fileExists(`${path}/vue-ssr-client-manifest.json`)
      await fileExists(`${path}/vue-ssr-server-bundle.json`)
      bundlesReady = true
      resolve()
    } catch (err) {
      setTimeout(async () => {
        resolve(await awaitBundles())
      }, 500)
    }
  })
}

/**
 * View Controller rendering data into templates
 */
class ViewController {
  /**
   * Render View with data from Endpoint. Returns the html back to the endpoint
   */
  async render (req) {
    if (!bundlesReady) await awaitBundles()
    const serverBundle = require(path.join(publicPath, 'vue-ssr-server-bundle.json'))
    const clientManifest = require(path.join(publicPath, 'vue-ssr-client-manifest.json'))
    const template = await readFile(path.join(__dirname, '../vue/index.template.html'), 'utf-8')
    const renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest,
      runInNewContext: false
    })
    const render = util.promisify(renderer.renderToString)
    const context = { req, api }
    return render(context)
  }
}

module.exports = new ViewController()
