import NodeIndex from '../node/index.js'
import BrowserClient from './client.js'

class Interface extends NodeIndex {
  _createClient () {
    this.client = new BrowserClient(this.options)
    this.client.connect()
  }
}

export default Interface
