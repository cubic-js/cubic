const load = require('cubic-loader')
const Auth = require('cubic-auth')
const Api = require('cubic-api')
const Core = require('cubic-core')
const View = require('cubic-ui')
const defaults = require('cubic-defaults')
const intro = require('./intro.js')

class Cubic {
  constructor(options = {}) {
    this.options = options
  }

  /**
   * Ensure cubic-loader is loaded
   */
  init() {
    try { cubic }
    catch (err) {
      load(this.options)
      if (this.options.logLevel !== 'silent') {
        intro.roll()
      }
    }
  }

  /**
   * Load cubic with default nodes
   */
  async bootstrap () {
    this.init()
    await defaults.verify()
    await cubic.use(new Auth())
    await cubic.use(new Api())
    await cubic.use(new Core())
    await cubic.use(new View())
  }

  /**
   * Imitate cubic.hook to hook functions before a node is loaded
   */
  hook(node, fn) {
    this.init()
    cubic.hook(node, fn)
  }

  /**
   * Imitate cubic.use to load new nodes
   */
  use(node) {
    this.init()
    cubic.use(node)
  }
}

module.exports = cubic