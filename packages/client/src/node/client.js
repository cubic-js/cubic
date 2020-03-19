const API = require('./api.js')

/**
 * Client class.
 * This is the actual client that handles auth and api logic.
 */
class Client {
  constructor (options) {
    this.options = options
    this.api = new API(this.options.api_url, this.options)
    this.api.connect()
  }

  async query (verb, query) {
    return this.api.request(verb, query)
  }
}

module.exports = Client
