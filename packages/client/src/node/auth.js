const Connection = require('./connection.js')

/**
 * Authentication class.
 * Handles the connection to the auth server.
 */
class Auth extends Connection {
  constructor () {
    super()
  }
}

module.exports = Auth
