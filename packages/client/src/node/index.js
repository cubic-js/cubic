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
    this.client = new Client(this.options)
    this.client.connect()
  }

  /**
   * Subscribe to certain endpoints
   * TODO: Implement
   */
  async subscribe (room, fn) {
  }

  /**
   * Unsubscribe from endpoints again
   * TODO: Implement
   */
  async unsubscribe (room) {
  }

  /**
   * RESTful methods for manual interaction
   */
  get (query) {
    return this.client.query('GET', query)
  }

  post (url, body) {
    return this.client.query('POST', { url, body })
  }

  put (url, body) {
    return this.client.query('PUT', { url, body })
  }

  patch (url, body) {
    return this.client.query('PATCH', { url, body })
  }

  delete (url, body) {
    return this.client.query('DELETE', { url, body })
  }

  /**
   * Change user at runtime. Automatically reloads connection.
   * TODO: Implement
   */
  async login (user, secret) {
  }

  /**
   * Manually set refresh token. This way user credentials won't be exposed to this package.
   * TODO: Implement
   */
  async setRefreshToken (token) {
  }

  /**
   * Retrieve current refresh token. Will await any existing authentication
   * processes. Useful if the initial login can be done through user/pass but
   * the refresh token needs to be stored for subsequent logins.
   * TODO: Implement
   */
  async getRefreshToken () {
  }

  /**
   * Manually set access token.
   * TODO: Implement
   */
  async setAccessToken (token) {
  }

  /**
   * Retrieve current access token.
   * TODO: Implement
   */
  async getAccessToken () {
  }
}

module.exports = Interface
