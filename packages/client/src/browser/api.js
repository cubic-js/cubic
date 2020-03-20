import BrowserConnection from './connection.js'
import NodeAPI from '../node/api.js'

class API extends NodeAPI {}

// Implement custom Client methods manually like this
// since JS has no multi-inheritance
API.prototype._createConnection = BrowserConnection.prototype._createConnection

export default API
