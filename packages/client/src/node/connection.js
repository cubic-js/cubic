const WebSocket = require('isomorphic-ws')
const Mutex = require('async-mutex').Mutex

/**
 * Connection class.
 * Here is where the actual WebSocket connection and logic gets handled.
 */
class Connection {
  constructor (url, options) {
    this.url = url
    this.options = options
    // this.request = { delay: this.options.requestDelay || 500, counter: 0 }
    // this.reconnect = { delay: this.options.reconnectDelay || 500, counter: 0 }
    this.lastHeartbeat = new Date()
    this.mutex = new Mutex()
  }

  async connect () {
    const release = await this.mutex.acquire()
    await this._createConnection()
    release()
  }

  /**
   * Create WebSocket connection
   */
  async _createConnection () {
    const wss = new WebSocket(this.url)
    wss.onopen = () => console.log('connection open')
    wss.onerror = (error) => console.log(`WebSocket Error: ${error.message}`)
    // TODO: Implement reconnect https://github.com/websockets/ws/blob/HEAD/doc/ws.md#event-close-1
    // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    wss.onclose = (close) => console.log(`connection closed with code ${close.code}`)
    wss.onmessage = (message) => this._onMessage(message.data)
    this.connection = wss
  }

  /**
   * WebSocket message handling
   */
  async _onMessage (data) {
    data = JSON.parse(data)
    console.log(`connection received message: ${data}`)

    // Heartbeat
    if (typeof data === 'string' && data.startsWith('primus::ping::')) {
      this.lastHeartbeat = new Date()
      this.connection.send(JSON.stringify(data.replace('ping', 'pong')))
    }

    // Request
    // TODO: Implement
    else if (data.action === 'RES' && data.id) {

    }

    // Publish
    // TODO: Implement
    else if (data.action === 'PUBLISH') {

    }

    // Unknown message type
    else console.log(`Couldn't process message: ${data}`)
  }
}

module.exports = Connection
