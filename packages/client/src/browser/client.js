import NodeClient from '../node/client.js'
import BrowserAuth from './auth.js'
import BrowserAPI from './api.js'

class Client extends NodeClient {
  constructor (options) {
    options.isBrowser = true // Won't init node auth and API
    super(options)

    this.api = new BrowserAPI(this.options.api_url, this.options)
    this.auth = new BrowserAuth(this.options.auth_url, {
      user_key: this.options.user_key,
      user_secret: this.options.user_secret
    })
  }
}

export default Client
