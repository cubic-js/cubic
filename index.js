/**
 * blitz.js authentication server
 * Web-API to get authentication for resource servers
 */
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
    // Config which is called by blitz.js on blitz.use()
    this.config = {
      local: local,
      provided: options
    }
  }

  async init () {
    const Core = require('blitz-js-core')
    const API = require('blitz-js-api')

    ///blitz.hook(options.id, purge.purgeInactiveUsers)
    blitz.use(new API(blitz.config.auth.api))

    // Core Node which processes incoming requests
    blitz.hook(blitz.config.auth.api.id, preauth.verifyUserIndices)
    await blitz.use(new Core(blitz.config.auth.core))

    // Hook auth listener manually before node is connected
    if (!blitz.config.auth.api.disable && !blitz.config.auth.disable) {
      preauth.validateWorker()
    }
  }
}

module.exports = Auth
