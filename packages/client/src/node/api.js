const Connection = require('./connection.js')
const ServerError = require('./serverError.js')

/**
 * API class.
 * Handles the connection to the API server.
 */
class API extends Connection {
  /**
   * Sets access token for API
   */
  async setAccessToken (token) {
    this.apiAccessToken = token
  }

  async _errCheck (res, verb, query) {
    // If expired: return custom object to so parent client can refresh token
    if (res.body && res.body.reason && res.body.reason.includes('jwt expired')) {
      return { EXPIRED: true, verb, query }
    }

    // Request timed out in queue stack -> push it back to the end
    else if (!res.statusCode && res.includes('timed out')) return false

    // Rate Limited
    else if (res.statusCode === 429) return false

    // Nodes are busy -> retry
    else if (res.statusCode === 503) return false

    // Unhandled error
    else if (parseInt(res.statusCode.toString().charAt(0)) > 3) throw new ServerError(res, query)

    // No error
    return res.body
  }
}

module.exports = API
