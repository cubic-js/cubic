import NodeClient from '../node/client.js'

class Client extends NodeClient {
  setClient () {
    const WS = WebSocket
    return new Promise(resolve => {
      // Resolve the initial promise, even when reconnecting
      if (!this.resolve) this.resolve = resolve

      const url = this.auth && this.auth.access_token
        ? `${this.url}?bearer=${this.auth.access_token}`
        : this.url
      this.client = new WS(url)
      this.client.onopen = () => {
        this.connected = true
        this.resolve()
        this.resolve = null
        this.connecting = null
      }
      this.client.onclose = e => this.reconnect()
      this.client.onerror = e => this.reconnect()
      this.client.onmessage = m => this.onMessage(m.data)

      // There's a chance the connection attempt gets "lost" when the API server
      // isn't up in time, so just retry if that happens.
      setTimeout(() => {
        if (!this.connected) {
          this.connected = true // reconnect won't run otherwise
          this.reconnect()
        }
      }, 1000)
    })
  }
}

export default Client
