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
    this.auth = new Auth(this.options.auth_url, {
      user_key: this.options.user_key,
      user_secret: this.options.user_secret
    })
  }

  async connect () {
    await this.auth.connect()
    await this.auth.authorize()
    await this.api.setAccessToken(this.auth.access_token)
    await this.api.connect()
  }

  async query (verb, query) {
    const res = await this.api.request(verb, query)

    // Refresh token if expired
    if (res.EXPIRED) {
      await this.auth.authorize()
      await this.api.setAccessToken(this.auth.access_token)
      return res.fn()
    }

    return res
  }
}

module.exports = Client
