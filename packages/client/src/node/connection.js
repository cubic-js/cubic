const WebSocket = require('isomorphic-ws')
const Mutex = require('async-mutex').Mutex

// Pseudo helper enum for Websocket states
const state = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}

/**
 * Connection class.
 * Here is where the actual WebSocket connection and logic gets handled.
 */
class Connection {
  constructor (url, options) {
    this.url = url
    this.options = options
    this.timeout = 1000 * 30 || options.timeout
    // this.request = { delay: this.options.requestDelay || 500, counter: 0 }
    this.reconnect = { delay: this.options.reconnectDelay || 500, counter: 0 }
    this.lastHeartbeat = new Date()
    this.mutex = new Mutex()

    // Heartbeat check. If the heartbeat takes too long we can assume the connection died.
    setInterval(async () => {
      if (new Date() - this.lastHeartbeat > this.timeout && this.connection && this.connection.readyState === state.OPEN) this.connection.close(1001, 'Heartbeat took too long.')
    }, this.timeout)
  }

  async connect () {
    const release = await this.mutex.acquire()
    await this._createConnection()
    release()
  }

  /**
   * Helper function to wait for connection to go up
   */
  async awaitConnection () {
    while (true) if (this.connection.readyState === state.OPEN) return
  }

  /**
   * Reconnection logic
   */
  async _reconnect () {
    // Return if connection is connecting or already open
    if (this.connection && this.connection.readyState <= state.OPEN) return
    const release = await this.mutex.acquire()

    // Wait reconnection delay
    await new Promise((resolve) => setTimeout(() => resolve(), this.reconnect.delay * Math.pow(2, this.reconnect.counter)))
    this.reconnect.counter++
    await this._createConnection()

    release()
  }

  /**
   * Create WebSocket connection
   */
  async _createConnection () {
    const wss = new WebSocket(this.url)
    wss.onopen = () => console.log('Connection open')
    wss.onerror = (error) => console.log(`WebSocket Error: ${error.message}`)
    wss.onclose = (close) => {
      console.log(`Connection closed with code ${close.code}.`)
      if (close.code !== 1000) this._reconnect() // Not closed deliberately
    }
    wss.onmessage = (message) => this._onMessage(message.data)
    this.connection = wss
  }

  /**
   * WebSocket message handling
   */
  async _onMessage (data) {
    data = JSON.parse(data)
    console.log(`Connection received message: ${data}`)

    // Heartbeat
    if (typeof data === 'string' && data.startsWith('primus::ping::')) {
      this.lastHeartbeat = new Date()
      this.connection.send(JSON.stringify(data.replace('ping', 'pong')))
      this.reconnect.counter = 0 // Assume stable connection if heartbeat is received
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
