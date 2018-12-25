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
    await cubic.use(new API(cubic.config.ui.api))
    this.webpackServer = new WebpackServer()
  }
}

module.exports = Ui
