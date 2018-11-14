const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const path = require('path')
const publicPath = require(cubic.config.ui.webpack.clientConfig).output.path
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer
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

class ViewController {
  /**
   * Renders HTML with `req` from endpoint's render() function.
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
    return render({ req })
  }
}

module.exports = new ViewController()
