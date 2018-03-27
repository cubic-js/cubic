import Connection from './connection.js'

class Blitz {

  /**
   * Merge default options with client options
   */
  constructor(options) {
    this.options = Object.assign({

      // Resource Config
      api_url: 'http://localhost:3003/',
      auth_url: 'http://localhost:3030/',

      // Connection Config
      namespace: '/',

      // Authorization Config
      user_key: null,
      user_secret: null,
      ignore_limiter: false
    }, options)

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
  async connect() {
    this.connection = new Connection(this.options)
    this.connecting = this.connection.connect()
    await this.connecting
  }


  /**
   * Subscribe to certain endpoints
   */
  async subscribe (endpoint, fn) {
    await this.connecting
    this.emit('subscribe', endpoint)

    // Function passed? Listen to subscribed endpoint directly.
    fn ? this.on(endpoint, fn) : null
  }


  /**
   * Unsubscribe from endpoints again
   */
  async unsubscribe (endpoint) {
    await this.connecting
    this.emit('unsubscribe', endpoint)
    this.connection.client.off(endpoint)
  }


  /**
   * Event listening for socket.io
   */
  async on(ev, func) {
    await this.connecting
    this.connection.client.on(ev, func)
  }


  /**
   * Expose Socket client emit
   */
  async emit(ev, data) {
    await this.connecting
    this.connection.client.emit(ev, data)
  }


  /**
   * RESTful methods for manual interaction
   */
  async query(verb, query) {
    await this.connecting
    return this.connection.request(verb, query)
  }

  get(query) {
    return this.query('GET', query)
  }

  post(url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query('POST', query)
  }

  put(url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query('PUT', query)
  }

  patch(url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query('PATCH', query)
  }

  delete(url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query('DELETE', query)
  }

  /**
   * Change user at runtime. Automatically reloads connection.
   */
  async login(user, secret) {
    this.connection.auth.options.user_key = user
    this.connection.auth.options.user_secret = secret
    return this.connection.reload(false)
  }


  /**
   * Manually set refresh token. This way user credentials won't be exposed
   * to this package.
   */
  async setRefreshToken(token) {
    await this.connecting
    await this.connection.reconnecting
    this.connection.auth.refresh_token = token
  }


  /**
   * Retrieve current refresh token. Will await any existing authentication
   * processes. Useful if the initial login can be done through user/pass but
   * the refresh token needs to be stored for subsequent logins.
   */
  async getRefreshToken() {
    await this.connecting
    await this.connection.reconnecting
    return this.connection.auth.refresh_token
  }


  /**
   * Manually set access token.
   */
  async setAccessToken(token) {
    await this.connecting
    await this.connection.reconnecting
    this.connection.auth.access_token = token
  }


  /**
   * Retrieve current access token.
   */
  async getAccessToken() {
    await this.connecting
    await this.connection.reconnecting
    return this.connection.auth.access_token
  }
}

export default Blitz
