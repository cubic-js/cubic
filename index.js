const BlitzLoader = require('../blitz-js-loader')
const intro = require('./intro.js')
const Auth = require('../blitz-js-auth')
const Api = require('../blitz-js-api')
const Core = require('../blitz-js-core')
const View = require('../blitz-js-view')

class Blitz {
  /**
   * Load blitz-js with default nodes
   */
  load (config) {
    this.init(config)
    blitz.use(new Api())
    blitz.use(new Core())
    blitz.use(new Auth())
    blitz.use(new View())
  }

  /**
   * Load blitz-js without default nodes
   */
  init (config) {
    BlitzLoader(config)
    intro.roll()
  }
}

module.exports = new Blitz