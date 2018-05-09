const Core = require('cubic-core')
const API = require('../cubic-api')
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

    // Attach token from cookie to req
    if (!cubic.config.ui.api.disable) {
      cubic.nodes.ui.api.server.http.app.use((req, res, next) => {
        const cookies = new Cookies(req, res)
        const token = cookies.get(cubic.config.ui.client.sessionKey)
        if (token && !req.headers.authorization) req.headers.authorization = `bearer ${token}`
        next()
      })

      // Move cookie middleware to the beginning of the stack
      const middlewareStack = cubic.nodes.ui.api.server.http.app._router.stack
      middlewareStack.unshift(middlewareStack.pop())
    }

    // Build webpack bundles
    if (!cubic.config.ui.core.disable) {
      const controller = cubic.nodes.ui.core.client.endpointController
      endpoints.override(controller)
      endpoints.rebuild(controller)
      cubic.nodes.ui.core.webpackServer = new WebpackServer()
    }
  }
}

module.exports = Ui
