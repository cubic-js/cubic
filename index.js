const Core = require('blitz-js-core')
const API = require('blitz-js-api')
const local = require('./config/local.js')
const preauth = require('./hooks/preauth.js')
const purge = require('./hooks/purge.js')

/**
 * Loader for auth-node system. For ease of maintenance, the auth-node consists
 * of a core-node that is connected to its own api-node as web server, much
 * like a regular blitz.js project
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
    await blitz.use(new API(blitz.config.auth.api))
    if (!blitz.config.auth.api.disable) {
      preauth.validateWorker()
    }

    // Core Node which processes incoming requests
    blitz.hook('auth.core', preauth.verifyUserIndices)
    await blitz.use(new Core(blitz.config.auth.core))
  }
}

module.exports = Auth
