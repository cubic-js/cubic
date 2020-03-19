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
    this.mutex = new Mutex()
  }

  async connect () {
    const release = await this.mutex.aquire()
    await this._createConnection()
    release()
  }

  /**
   * Create WebSocket connection
   */
  async _createConnection () {
    const wss = new WebSocket(this.url)
    wss.onopen = () => console.log('connection open')
    wss.onerror = (error) => console.log(`WebSocket Error: ${error.message}`) // https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent
    // TODO: Implement reconnect https://github.com/websockets/ws/blob/HEAD/doc/ws.md#event-close-1
    // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    wss.onclose = (close) => {}
    wss.onmessage = (message) => console.log(message.data) // https://developer.mozilla.org/de/docs/Web/API/MessageEvent
    this.connection = wss
  }
}

module.exports = Connection
