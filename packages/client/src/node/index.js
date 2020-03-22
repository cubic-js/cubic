const Client = require('./client.js')

/**
 * Client API. Provides a public interface for the actual client.
 */
class Interface {
  constructor (options) {
    this.options = {
      ...{
        api_url: 'ws://localhost:3003/ws',
        auth_url: 'ws://localhost:3030/ws',
        user_key: null,
        user_secret: null
      },
      ...options
    }

    // Remove '/' from end of connection URLs
    let api = this.options.api_url
    let auth = this.options.auth_url
    this.options.api_url = api[api.length - 1] === '/' ? api.slice(0, -1) : api
    this.options.auth_url = auth[auth.length - 1] === '/' ? auth.slice(0, -1) : auth

    // Create client
    this._createClient()
  }

  /**
   * Helper functions to wait for connection to go up
   */
  awaitConnection () {
    return this.client.awaitConnection()
  }

  /**
   * Helper function to see if connection is up
   */
  isConnected () {
    return this.client.api.isConnected()
  }

  /**
   * Subscribe to certain endpoints
   */
  subscribe (room, fn) {
    return this.client.subscribe(room, fn)
  }

  /**
   * Unsubscribe from endpoints again
   */
  unsubscribe (room) {
    return this.client.unsubscribe(room)
  }

  /**
   * RESTful methods for manual interaction
   */
  query (verb, query) {
    return this.client.query(verb, query)
  }

  get (query) {
    return this.query('GET', query)
  }

  post (url, body) {
    return this.query('POST', { url, body })
  }

  put (url, body) {
    return this.query('PUT', { url, body })
  }

  patch (url, body) {
    return this.query('PATCH', { url, body })
  }

  delete (url, body) {
    return this.query('DELETE', { url, body })
  }

  /**
   * Change user at runtime. Automatically reloads connection.
   */
  login (user, secret) {
    return this.client.login(user, secret)
  }

  /**
   * Manually set refresh token. This way user credentials won't be exposed to this package.
   */
  async setRefreshToken (token) {
    this.client.auth.refresh_token = token
  }

  /**
   * Retrieve current refresh token. Will await any existing authentication
   * processes. Useful if the initial login can be done through user/pass but
   * the refresh token needs to be stored for subsequent logins.
   */
  async getRefreshToken () {
    return this.client.auth.refresh_token
  }

  /**
   * Manually set access token.
   */
  setAccessToken (token) {
    return this.client.setAccessToken(token)
  }

  /**
   * Retrieve current access token.
   */
  async getAccessToken () {
    return this.client.auth.access_token
  }

  /**
   * This function is only there so it can be overwritten by the browser build
   */
  _createClient () {
    this.client = new Client(this.options)
    this.client.connect()
  }
}

module.exports = Interface
