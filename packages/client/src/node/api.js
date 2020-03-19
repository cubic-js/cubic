const Connection = require('./connection.js')

/**
 * API class.
 * Handles the connection to the API server.
 */
class API extends Connection {
  constructor (url, options) {
    super(url, options)
  }
}

module.exports = API
