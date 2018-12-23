const Endpoint = require('cubic-api/endpoint')
const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const path = require('path')
const publicPath = `${cubic.config.ui.api.publicPath}/bundles`
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer
const { promisify } = require('util')
const fileExists = promisify(fs.lstat)
const Client = require('cubic-client')
const user = cubic.nodes.auth ? cubic.nodes.auth.api.systemUser : {}
const api = new Client({
  api_url: cubic.config.ui.client.apiUrl,
  auth_url: cubic.config.ui.client.authUrl,
  user_key: user.user_key || cubic.config.ui.client.user_key,
  user_secret: user.user_secret || cubic.config.ui.client.user_secret
})

/**
 * One-time check, so we wouldn't read from disk on every request
 */
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
 * Overrides original endpoint. This one only adds the view key to the schema
 * and renders it in the main function by default, since that's what all normal
 * pages do.
 */
class View extends Endpoint {
  /**
   * Just render the given view if no other instructions are given.
   */
  async main (req, res) {
    res.setHeader('content-type', 'text/html')
    return res.send(await this.render(req))
  }

  /**
   * Render page with Vue.js
   */
  async render (req) {
    if (!bundlesReady) await awaitBundles()
    const serverBundle = require(path.join(publicPath, 'vue-ssr-server-bundle.json'))
    const clientManifest = require(path.join(publicPath, 'vue-ssr-client-manifest.json'))
    const template = await readFile(path.join(__dirname, './vue/index.template.html'), 'utf-8')
    const renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest,
      runInNewContext: false
    })
    const render = util.promisify(renderer.renderToString)
    const context = { req, api }
    const html = await render(context)
    this.cache(html, cubic.config.ui.api.cacheExp, { 'content-type': 'text/html' })
    return html
  }
}

module.exports = View
