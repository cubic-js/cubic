const API = require('./api.js')
const Auth = require('./auth.js')

/**
 * Client class.
 * This is the actual client that handles auth and api logic.
 */
class Client {
  constructor (options) {
    this.options = options

    this.api = new API(this.options.api_url, this.options)
    this.api.connect()

    this.auth = new Auth(this.options.auth_url, {
      user_key: this.options.user_key,
      user_secret: this.options.user_secret
    })
    this.auth.connect()
  }

  query (verb, query) {
    return this.api.request(verb, query)
  }
}

module.exports = Client
