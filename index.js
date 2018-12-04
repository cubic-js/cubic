const Loader = require('./lib/loader.js')
const intro = require('./lib/intro.js')

class Cubic extends Loader {
  constructor (options) {
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
      const Core = require('cubic-core')
      const Ui = require('cubic-ui')
      const defaults = require('cubic-defaults')

      this.init()
      await defaults.verify()
      await cubic.use(new Auth())
      cubic.use(new Api())
      cubic.use(new Core())
      cubic.use(new Ui())
    } catch (err) {
      console.error(`Make sure to install all cubic dependencies when using the bootstrap method.`)
      throw err
    }
  }
}

module.exports = Cubic
