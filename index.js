const Core = require("cubic-core")
const API = require("cubic-api")
const local = require("./config/local.js")
const WebpackServer = require('./controllers/webpack.js')
const endpoints = require('./override/endpoints.js')

/**
 * Loader for auth-node system. For ease of maintenance, the auth-node consists
 * of a core-node that is connected to its own api-node as web server, much
 * like a regular cubic project
 */
class View {
  constructor(options) {
    this.config = {
      local: local,
      provided: options || {}
    }
  }

  /**
   * Hook node components for actual logic
   */
  async init() {
    await cubic.use(new API(cubic.config.view.api))
    await cubic.use(new Core(cubic.config.view.core))

    // Provide custom endpoint for views
    this.Endpoint = require(cubic.config.view.core.endpointParent)

    // Build webpack bundles
    if (!cubic.config.view.core.disable) {
      const controller = cubic.nodes.view.core.client.endpointController
      endpoints.override(controller)
      endpoints.rebuild(controller)
      this.webpackServer = new WebpackServer()
    }
  }
}

module.exports = View
