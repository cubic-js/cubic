const Core = require('cubic-core')
const API = require('cubic-api')
const local = require('./config/local.js')
const WebpackServer = require('./controllers/webpack.js')
const endpoints = require('./override/endpoints.js')
const Cookies = require('cookies')

class Ui {
  constructor (options) {
    this.config = {
      local: local,
      provided: options || {}
    }
  }

  /**
   * Hook node components for actual logic
   */
  async init () {
    await cubic.use(new API(cubic.config.ui.api))
    await cubic.use(new Core(cubic.config.ui.core))

    // Provide custom endpoint for views
    this.Endpoint = require(cubic.config.ui.core.endpointParent)

    // Build webpack bundles
    if (!cubic.config.ui.core.disable) {
      const controller = cubic.nodes.ui.core.client.endpointController
      endpoints.override(controller)
      endpoints.rebuild(controller)
      this.webpackServer = new WebpackServer()
    }
  }
}

module.exports = Ui
