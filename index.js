const load = require('blitz-js-loader')
const Auth = require('blitz-js-auth')
const Api = require('blitz-js-api')
const Core = require('blitz-js-core')
const View = require('blitz-js-view')
const defaults = require('blitz-js-defaults')
const intro = require('./intro.js')

class Blitz {
  constructor(options) {
    this.options = options
  }

  /**
   * Ensure blitz-js-loader is loaded
   */
  init() {
    try { blitz }
    catch (err) {
      load(this.options)
      if (this.options.logLevel !== 'silent') {
        intro.roll()
      }
    }
  }

  /**
   * Load blitz-js with default nodes
   */
  bootstrap () {
    this.init()
    defaults.verify()
    blitz.use(new Api())
    blitz.use(new Core())
    blitz.use(new Auth())
    blitz.use(new View())
  }

  /**
   * Imitate blitz.hook to hook functions before a node is loaded
   */
  hook(node, fn) {
    this.init()
    blitz.hook(node, fn)
  }

  /**
   * Imitate blitz.use to load new nodes
   */
  use(node) {
    this.init()
    blitz.use(node)
  }
}

module.exports = Blitz