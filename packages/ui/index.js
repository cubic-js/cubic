const Transformer = require('./transformer')

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
    const transformer = new Transformer()
    await transformer.apply(ui)
    ui.webpackServer = new WebpackServer()
    await ui.webpackServer.init()
  }
}

module.exports = Ui
