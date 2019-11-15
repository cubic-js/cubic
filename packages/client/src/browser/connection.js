import BrowserClient from './client.js'
import NodeConnection from '../node/connection.js'

class Connection extends NodeConnection {}

// Implement custom Client methods manually like this
// since JS has no multi-inheritance
Connection.prototype.setClient = BrowserClient.prototype.setClient

export default Connection
