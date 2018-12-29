const API = require('cubic-api')
const local = require('./config/local.js')
const WebpackServer = require('./webpack/webpack.js')

class Ui {
  constructor (options) {
    this.config = {
      local: local,
      provided: options || {}
    }
  }

  async init () {
    const ui = await cubic.use(new API(cubic.config.ui.api))
    ui.webpackServer = new WebpackServer()
  }
}

module.exports = Ui
