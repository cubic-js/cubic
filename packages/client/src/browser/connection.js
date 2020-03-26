import NodeConnection from '../node/connection.js'

class Connection extends NodeConnection {
  async _createConnection () {
    const WS = WebSocket
    const url = this.apiAccessToken ? `${this.url}?bearer=${this.apiAccessToken}` : this.url

    const wss = new WS(url)
    wss.onopen = () => this._resumeConnection()
    wss.onerror = (error) => console.log(`WebSocket Error: ${error.message}`)
    wss.onclose = (close) => { if (close.code !== 1000) this._reconnect() } // Not closed deliberately
    wss.onmessage = (message) => this._onMessage(message.data)
    this.connection = wss
  }
}

export default Connection
