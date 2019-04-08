class Ui {
  constructor (options) {
    const local = require('./config/local.js')
    this.config = {
      local: local,
      provided: options || {}
    }
  }

  async init () {
    const API = require('cubic-api')
    const WebpackServer = require('./webpack/webpack.js')
    const ui = await cubic.use(new API(cubic.config.ui.api))
    ui.webpackServer = new WebpackServer()
  }
}

module.exports = Ui
