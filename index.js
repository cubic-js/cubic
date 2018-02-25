const Core = require("blitz-js-core")
const API = require("blitz-js-api")
const local = require("./config/local.js")
const WebpackServer = require('./controllers/webpack.js')
const endpoints = require('./override/endpoints.js')

/**
 * Loader for auth-node system. For ease of maintenance, the auth-node consists
 * of a core-node that is connected to its own api-node as web server, much
 * like a regular blitz.js project
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
    await blitz.use(new API(blitz.config.view.api))
    await blitz.use(new Core(blitz.config.view.core))

    // Provide custom endpoint for views
    this.Endpoint = require(blitz.config.view.core.endpointParent)

    // Build webpack bundles
    if (!blitz.config.view.core.disable) {
      const controller = blitz.nodes.view.core.client.endpointController
      endpoints.override(controller)
      endpoints.rebuild(controller)
      this.webpackServer = new WebpackServer()
    }
  }
}

module.exports = View
