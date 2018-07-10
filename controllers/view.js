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


/**
 * Render Dependencies
 */
const publicPath = require(cubic.config.ui.webpack.clientConfig).output.path
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
      await fileExists(`${publicPath}/vue-ssr-client-manifest.json`)
      await fileExists(`${publicPath}/vue-ssr-server-bundle.json`)
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

    const Client = require('cubic-client')
    const api = new Client({
      api_url: cubic.config.ui.client.apiUrl,
      auth_url: cubic.config.ui.client.authUrl
    })
    if (req.access_token) await api.setAccessToken(req.access_token)

    const context = { req, api }
    return render(context)
  }
}

module.exports = new ViewController()
