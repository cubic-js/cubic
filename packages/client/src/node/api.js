const Connection = require('./connection.js')
const ServerError = require('./serverError.js')

/**
 * API class.
 * Handles the connection to the API server.
 */
class API extends Connection {
  async _errCheck (res, verb, query) {
    // Queued function timed out
    if (typeof res === 'string' && res.includes('timed out')) return this._retry(res, verb, query)

    // If expired: Get new token w/ refresh token & retry method
    // TODO: Implement
    else if (res.body && res.body.reason && res.body.reason.includes('jwt expired')) {
      // await this.reconnect()
      return this._retry(res, verb, query)
    }

    // Request timed out in queue stack -> push it back to the end
    else if (!res.statusCode && res.includes('timed out')) return this._retry(res, verb, query)

    // Rate Limited
    else if (res.statusCode === 429) return this._retry(res, verb, query)

    // Nodes are busy -> retry
    else if (res.statusCode === 503) return this._retry(res, verb, query)

    // Unhandled error
    else if (parseInt(res.statusCode.toString()[0]) > 3) throw new ServerError(res, query)

    // No error
    this.req.counter = 0
    return res.body
  }
}

module.exports = API
