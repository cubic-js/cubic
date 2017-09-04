const io = require("socket.io-client")
const timeout = (fn, s) => {
  return new Promise(resolve => setTimeout(() => resolve(fn()), s))
}

/**
 * Handles authorization on blitz auth-node and token handling via HTTP
 */
class Auth {
  constructor (options) {
    this.options = options
    this.client = io.connect(this.options.auth_url + "/")
  }

  /**
   * Actual Request Code
   */
  async req(verb, query) {
    let res = await new Promise(resolve => this.client.emit(verb, query, resolve))
    res = JSON.parse(res.body)
    if (res.error) {
      throw res
    } else {
      return res
    }
  }

  /**
   * Get tokens for API authentication if credentials provided
   */
  async authorize () {
    if (this.options.user_key && this.options.user_secret) {
      return this.getToken()
    }
  }

  /**
   * Refresh tokens if possible
   */
  async reauthorize () {
    if (this.options.user_key && this.options.user_secret) {
      return this.refreshToken()
    }
  }

  /**
   * Get Token via http on /auth
   */
  async getToken () {
    const auth_request = {
      user_key: this.options.user_key,
      user_secret: this.options.user_secret
    }

    try {
      let res = await this.req("POST", {
        url: '/token',
        body: auth_request
      })
      this.access_token = res.access_token
      this.refresh_token = res.refresh_token
    } catch (err) {
      let timeout = err.reason ? parseInt(err.reason.replace(/[^0-9]+/g, '')) : 5000
      await timeout(() => this.getToken(), timeout)
    }
  }

  /**
   * Get new access token from refresh_token & save in object
   */
  async refreshToken () {
    // Ensure only one refresh process is done at a time
    if (!this.refreshing) {
      this.refreshing = true
      let auth_request = {
        refresh_token: this.refresh_token
      }

      // Send to /auth endpoint
      try {
        let res = await this.req("POST", {
          url: '/token',
          body: auth_request
        })
        this.access_token = res.access_token
        this.refreshing = false
      } catch (err) {
        this.refreshing = false
        let timeout = err.reason ? parseInt(err.reason.replace(/[^0-9]+/g, '')) : 5000
        await timeout(() => this.refreshToken(), timeout)
      }
    }
  }
}

module.exports = Auth
