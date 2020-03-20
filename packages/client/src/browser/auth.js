import BrowserConnection from './connection.js'
import NodeAuth from '../node/auth.js'

class Auth extends NodeAuth {}

// Implement custom Client methods manually like this
// since JS has no multi-inheritance
Auth.prototype._createConnection = BrowserConnection.prototype._createConnection

export default Auth
