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

    // Attach access token from cookie to req
    if (!cubic.config.ui.api.disable) {
      cubic.nodes.ui.api.server.http.app.use((req, res, next) => {
        const cookies = new Cookies(req, res)
        const token = cookies.get(cubic.config.ui.client.accessTokenCookie)
        if (token && !req.headers.authorization) {
          req.access_token = token
          req.headers.authorization = `bearer ${token}`
        }
        next()
      })
    }

    // Implicitly load sites as endpoints, start webpack bundler if required.
    if (!cubic.config.ui.core.disable) {
      const client = cubic.nodes.ui.core.client
      const controller = client.endpointController
      endpoints.override(controller)
      endpoints.rebuild(controller)
      client.sendEndpointSchema()
      cubic.nodes.ui.core.webpackServer = new WebpackServer()
    }
  }
}

module.exports = Ui
