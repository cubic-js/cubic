import BrowserClient from './client.js'
import NodeAuth from '../node/auth.js'

class Auth extends NodeAuth {}

// Implement custom Client methods manually like this
// since JS has no multi-inheritance
Auth.prototype.setClient = BrowserClient.prototype.setClient

export default Auth
