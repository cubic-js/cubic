const API = require('./api.js')
const Auth = require('./auth.js')

/**
 * Client class.
 * This is the actual client that handles auth and api logic.
 */
class Client {
  constructor (options) {
    this.options = options

    if (!this.options.isBrowser) {
      this.api = new API(this.options.api_url, this.options)
      this.auth = new Auth(this.options.auth_url, {
        user_key: this.options.user_key,
        user_secret: this.options.user_secret
      })
    }
  }

  /**
   * Helper functions to wait for connection to go up
   */
  awaitConnection () {
    return Promise.all([this.api.awaitConnection(), this.auth.awaitConnection()])
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
      await this.api.reloadConnection()
      return this.query(res.verb, res.query)
    }

    return res
  }

  /**
   * Subscribe to certain endpoints
   */
  async subscribe (room, fn) {
    await this.api.awaitConnection()
    this.api.connection.send(JSON.stringify({
      action: 'SUBSCRIBE',
      room
    }))
    this.api.subscriptions.push({ room, fn })
  }

  /**
   * Unsubscribe from endpoints again
   */
  async unsubscribe (room) {
    await this.api.awaitConnection()
    this.api.connection.send(JSON.stringify({
      action: 'UNSUBSCRIBE',
      room
    }))
    this.api.subscriptions = this.api.subscriptions.filter(s => s.room !== room)
  }

  /**
   * Change auth user and reload api
   */
  async login (user, secret) {
    await this.awaitConnection()
    await this.auth.login(user, secret)
    await this.api.setAccessToken(this.auth.access_token)
    await this.api.reloadConnection()
  }

  /**
   * Set access token and reload api
   */
  async setAccessToken (token) {
    this.auth.access_token = token
    await this.api.setAccessToken(this.auth.access_token)
    await this.api.reloadConnection()
  }
}

module.exports = Client
