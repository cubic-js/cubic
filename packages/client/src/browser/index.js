import Connection from './connection.js'
import NodeIndex from '../node/index.js'

class Client extends NodeIndex {
  // Use custom Connection (Client) for Browsers
  async connect () {
    this.connection = new Connection(this.options.api_url, this.options)
    this.connection.connect()
    await this.connecting()
  }
}

export default Client
