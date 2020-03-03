const Auth = require('./auth.js')
const ServerError = require('./serverError.js')
const Client = require('./client.js')

class Connection extends Client {
  constructor (url, options) {
    super(url, options)
    if (!options.isBrowser) {
      this.auth = new Auth(options.auth_url, {
        user_key: options.user_key,
        user_secret: options.user_secret,
        requestDelay: 100
      })
      this.auth.connect()
    }
  }

  /**
   * Get Tokens and build client
   */
  async connect () {
    await this.auth.authorize()
    switch (this.state) {
      case 'disconnected':
      case 'reconnecting':
      case 'connected':
        this.setClient()
        this.state = this.states.connecting
        try {
          await this._connecting()
          return
        } catch (e) {
          return this.reconnect()
        }
      default:
        break
    }
  }

  /**
   * Handles Error Responses
   */
  async errCheck (res = {}, verb, query) {
    // Queued function timed out
    if (typeof res === 'string' && res.includes('timed out')) {
      return this.retry(res, verb, query)
    }

    // If expired: Get new token w/ refresh token & retry method
    if (res.body && res.body.reason && res.body.reason.includes('jwt expired')) {
      await this.reconnect()
      return this.retry(res, verb, query)
    }

    // Request timed out in queue stack -> push it back to the end
    if (!res.statusCode) {
      if (res.includes('timed out')) {
        return this.retry(res, verb, query)
      }
    }

    // Rate Limited
    if (res.statusCode === 429) {
      return this.retry(res, verb, query)
    }

    // Nodes are busy -> retry
    if (res.statusCode === 503) {
      return this.retry(res, verb, query)
    }

    // Unhandled error
    if (parseInt(res.statusCode.toString()[0]) > 3) {
      throw new ServerError(res, query)
    }

    // No Error
    this.reRequestCounter = 0
    return res.body
  }
}

module.exports = Connection
