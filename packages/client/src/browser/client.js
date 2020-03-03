import NodeClient from '../node/client.js'

class Client extends NodeClient {
  async setClient () {
    const WS = WebSocket
    const url = this.auth && this.auth.access_token
      ? `${this.url}?bearer=${this.auth.access_token}`
      : this.url
    this.client = new WS(url)
    this.client.onopen = () => {
      this.state = this.states.connected
      this.reconnectCounter = 0
    }
    this.client.onclose = () => {
      this.state = this.states.disconnected
      this.reconnect()
    }
    this.client.onerror = e => {
      this.state = this.states.disconnected
      this.reconnect()
    }
    this.client.onmessage = data => this.onMessage(data)

    // There's a chance the connection attempt gets "lost" when the API server
    // isn't up in time, so just retry if that happens.
    return new Promise(resolve => {
      setTimeout(async () => {
        switch (this.state) {
          case 'connecting':
            await this.reconnect()
            resolve()
            break
          case 'reconnecting':
            await this.reconnect()
            resolve()
            break
          case 'connected':
            resolve()
            break
          default:
            return this._connecting()
        }
      }, this.connectionTimeout * Math.pow(2, this.reconnectCounter))
    })
  }
}

export default Client
