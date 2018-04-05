const Core = require('cubic-core')
const API = require('cubic-api')
const local = require('./config/local.js')
const preauth = require('./hooks/preauth.js')
const purge = require('./hooks/purge.js')

/**
 * Loader for auth-node system. For ease of maintenance, the auth-node consists
 * of a core-node that is connected to its own api-node as web server, much
 * like a regular cubic project
 */
class Auth {
  constructor (options) {
    this.config = {
      local: local,
      provided: options || {}
    }
  }

  async init () {

    // API node for distributing requests
    await cubic.use(new API(cubic.config.auth.api))
    if (!cubic.config.auth.api.disable) {
      preauth.validateWorker()
    }

    // Core Node which processes incoming requests
    cubic.hook('auth.core', preauth.verifyUserIndices)
    await cubic.use(new Core(cubic.config.auth.core))
  }
}

module.exports = Auth
