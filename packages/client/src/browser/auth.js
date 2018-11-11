import Client from './client.js'

class Auth extends Client {
  /**
   * Get tokens for API authentication if credentials are provided
   */
  async authorize (refresh = this.refresh_token) {
    if ((this.options.user_key && this.options.user_secret) || refresh) {
      return (refresh ? this.refreshToken() : this.getToken())
    }
  }

  /**
   * Get Token via http on /auth
   */
  async getToken () {
    const body = {
      user_key: this.options.user_key,
      user_secret: this.options.user_secret
    }

    const res = await this.request('POST', {
      url: '/authenticate',
      body
    })
    this.access_token = res.access_token
    this.refresh_token = res.refresh_token
  }

  /**
   * Get new access token from refresh_token & save in object
   */
  async refreshToken () {
    // Ensure only one refresh process is done at a time
    if (!this.refreshing) {
      this.refreshing = true
      const body = {
        refresh_token: this.refresh_token
      }

      const res = await this.request('POST', {
        url: '/refresh',
        body
      })
      this.access_token = res.access_token
      this.refreshing = false
    }
  }

  /**
   * Error handling
   */
  async errCheck (res, verb, query) {
    if (typeof res === 'string' && res.includes('timed out')) {
      return this.retry(res, verb, query)
    }
    if (res.statusCode >= 400) {
      if (res.statusCode !== 503 && res.statusCode !== 404 && res.statusCode !== 429) {
        console.error('cubic-client encountered an error while authenticating:')
        console.error(res.body)
        console.error(`retrying... \n`)
      }
      return this.retry(res, verb, query)
    } else {
      return res.body
    }
  }
}

export default Auth
