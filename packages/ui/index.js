const Core = require('./override/core.js')
const API = require('cubic-api')
const local = require('./config/local.js')
const WebpackServer = require('./controllers/webpack.js')

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

    if (!cubic.config.ui.core.disable) {
      cubic.nodes.ui.core.webpackServer = new WebpackServer()
    }
  }
}

module.exports = Ui
