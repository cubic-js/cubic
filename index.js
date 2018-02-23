const BlitzLoader = require('blitz-js-loader')
const Auth = require('blitz-js-auth')
const Api = require('blitz-js-api')
const Core = require('blitz-js-core')
const View = require('blitz-js-view')
const intro = require('./intro.js')

class Blitz {
  constructor (config) {
    const Blitz = BlitzLoader(config)
    intro.roll()
    return Blitz
  }

  /**
   * Load blitz-js with default nodes
   */
  bootstrap () {
    blitz.use(new Api())
    blitz.use(new Core())
    blitz.use(new Auth())
    blitz.use(new View())
  }
}

module.exports = Blitz