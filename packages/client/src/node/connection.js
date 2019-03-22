const Auth = require('./auth.js')
const ServerError = require('./serverError.js')
const Client = require('./client.js')

class Connection extends Client {
  constructor (url, options) {
    super(url, options)
    this.auth = new Auth(options.auth_url, {
      user_key: options.user_key,
      user_secret: options.user_secret,
      delay: 100
    })
    this.auth.connect()
  }

  /**
   * Get Tokens and build client
   */
  async connect () {
    const authAndConnect = async () => {
      await this.auth.authorize()
      await this.setClient()
    }
    return this.setConnection(authAndConnect())
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

    // Redirect. Assume res.body is redirect link
    if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
      return this.retry(res, verb, res.body)
    }

    // Unhandled error
    if (parseInt(res.statusCode.toString()[0]) > 3) {
      throw new ServerError(res, query)
    }

    // No Error
    return res.body
  }
}

module.exports = Connection
