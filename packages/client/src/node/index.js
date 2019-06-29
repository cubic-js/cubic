const Connection = require('./connection.js')

class Client {
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

    this.connect()
  }

  /**
   * Connect by getting tokens and setting up clients
   */
  async connect () {
    this.connection = new Connection(this.options.api_url, this.options)
    this.connection.connect()
    await this.connecting()
  }

  /**
   * Helper function to get current connection state
   */
  async connecting () {
    return this.connection.connecting
  }

  /**
   * Subscribe to certain endpoints
   */
  async subscribe (room, fn) {
    await this.connecting()
    this.connection.client.send(JSON.stringify({
      action: 'SUBSCRIBE',
      room
    }))
    this.connection.subscriptions.push({ room, fn })
  }

  /**
   * Unsubscribe from endpoints again
   */
  async unsubscribe (room) {
    await this.connecting()
    this.connection.client.send(JSON.stringify({
      action: 'UNSUBSCRIBE',
      room
    }))
    this.connection.subscriptions = this.connection.subscriptions.filter(s => s.room !== room)
  }

  /**
   * RESTful methods for manual interaction
   */
  async query (verb, query) {
    await this.connecting()
    return this.connection.request(verb, query)
  }

  get (query) {
    return this.query('GET', query)
  }

  post (url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query('POST', query)
  }

  put (url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query('PUT', query)
  }

  patch (url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query('PATCH', query)
  }

  delete (url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query('DELETE', query)
  }

  /**
   * Change user at runtime. Automatically reloads connection.
   */
  async login (user, secret) {
    await this.connecting()
    this.connection.auth.options.user_key = user
    this.connection.auth.options.user_secret = secret
    return this.connection.reconnect()
  }

  /**
   * Manually set refresh token. This way user credentials won't be exposed
   * to this package.
   */
  async setRefreshToken (token) {
    await this.connecting()
    this.connection.auth.refresh_token = token
  }

  /**
   * Retrieve current refresh token. Will await any existing authentication
   * processes. Useful if the initial login can be done through user/pass but
   * the refresh token needs to be stored for subsequent logins.
   */
  async getRefreshToken () {
    return this.connection.auth.refresh_token
  }

  /**
   * Manually set access token.
   */
  async setAccessToken (token) {
    await this.connecting()
    this.connection.auth.access_token = token
    await this.connection.reconnect()
  }

  /**
   * Retrieve current access token.
   */
  async getAccessToken () {
    return this.connection.auth.access_token
  }
}

module.exports = Client
