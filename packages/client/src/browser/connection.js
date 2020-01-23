import BrowserClient from './client.js'
import BrowserAuth from './auth.js'
import NodeConnection from '../node/connection.js'

class Connection extends NodeConnection {
  constructor (url, options) {
    options.isBrowser = true // won't initialize node auth client
    super(url, options)
    this.auth = new BrowserAuth(options.auth_url, {
      user_key: options.user_key,
      user_secret: options.user_secret,
      delay: 100
    })
    this.auth.connect()
  }
}

// Implement custom Client methods manually like this
// since JS has no multi-inheritance
Connection.prototype.setClient = BrowserClient.prototype.setClient

export default Connection
