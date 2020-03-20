const Connection = require('./connection.js')
const Mutex = require('async-mutex').Mutex

/**
 * Authentication class.
 * Handles the connection to the auth server.
 */
class Auth extends Connection {
  constructor (url, options) {
    super(url, options)

    this.authMutex = new Mutex()
  }

  /**
   * Get tokens for API authentication if credentials are provided
   */
  async authorize (refresh = this.refresh_token) {
    if (refresh || (this.options.user_key && this.options.user_secret)) {
      return refresh ? this._refreshToken() : this._getTokens()
    }
  }

  /**
   * Runtime login
   */
  async login (user, secret) {
    this.options.user_key = user
    this.options.user_secret = secret
    return this._getTokens()
  }

  /**
   * Get tokens via /authenticate request
   */
  async _getTokens () {
    const body = {
      user_key: this.options.user_key,
      user_secret: this.options.user_secret
    }

    const res = await this.request('POST', { url: '/authenticate', body })
    this.access_token = res.access_token
    this.refresh_token = res.refresh_token
  }

  /**
   * Generate new access token
   */
  async _refreshToken () {
    const release = this.authMutex.acquire()

    const body = { refresh_token: this.refresh_token }
    const res = await this.request('POST', { url: '/refresh', body })
    this.access_token = res.access_token

    release()
  }

  async _errCheck (res, verb, query) {
    // Queued function timed out
    if (typeof res === 'string' && res.includes('timed out')) return this._retry(res, verb, query)

    // Auth error
    else if (res.statusCode >= 400) {
      if (res.statusCode !== 503 && res.statusCode !== 404 && res.statusCode !== 429) {
        console.error('Cubic-client encountered an error while authenticating:')
        console.error(res.body)
        console.error(`retrying... \n`)
        return this._retry(res, verb, query)
      }
    }

    // No error
    this.req.counter = 0
    return res.body
  }
}

module.exports = Auth
