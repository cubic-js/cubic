const Loader = require('./lib/loader.js')
const intro = require('./lib/intro.js')
const config = require('./lib/config/cubic.js')

class Cubic extends Loader {
  constructor (options = config) {
    super(options)
    if (options.logLevel !== 'silent') {
      intro.roll()
    }
  }

  /**
   * Load cubic with default nodes
   */
  async bootstrap () {
    try {
      const Auth = require('cubic-auth')
      const Api = require('cubic-api')
      const Ui = require('cubic-ui')
      const defaults = require('cubic-defaults')
      const parallel = []

      this.init()
      await defaults.verify()
      await cubic.use(new Auth())
      parallel.push(cubic.use(new Api()))
      parallel.push(cubic.use(new Ui()))
      await Promise.all(parallel)
    } catch (err) {
      console.error(`Make sure to install all cubic dependencies when using the bootstrap method.`)
      throw err
    }
  }
}

module.exports = Cubic
