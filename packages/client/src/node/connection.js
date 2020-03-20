const WebSocket = require('isomorphic-ws')
const Mutex = require('async-mutex').Mutex
const queue = require('async-delay-queue')

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
    this.req = { delay: this.options.requestDelay || 500, counter: 0 }
    this.reconnect = { delay: this.options.reconnectDelay || 500, counter: 0 }

    this.lastHeartbeat = new Date()
    this.requests = []
    this.requestIds = 1
    this.queue = queue
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
  awaitConnection () {
    const poll = (resolve) => {
      if (this.connection && this.connection.readyState === state.OPEN) resolve()
      else setTimeout(_ => poll(resolve), 100)
    }
    return new Promise(poll)
  }

  /**
   * Make a request
   */
  async request (verb, query) {
    await this.awaitConnection()
    const res = await new Promise((resolve) => {
      const id = this.requestIds++
      const payload = { action: verb, id }
      if (typeof query === 'string') payload.url = query
      else {
        payload.url = query.url
        payload.body = query.body
      }

      this.requests.push({ id, resolve, verb, query })
      try {
        this.connection.send(JSON.stringify(payload))
      } catch (err) {
        this.requests.pop()
        this.client.emit('error', err)
      }
    })
    return this._errCheck(res, verb, query)
  }

  /**
   * Retry a failed request
   */
  async _retry (res, verb, query) {
    const ratelimit = res.body && res.body.reason ? parseInt(res.body.reason.replace(/[^0-9]+/g, '')) : null
    const delay = isNaN(ratelimit) ? this.req.delay : ratelimit
    const retry = this.queue.delay(this.request.bind(this, verb, query), delay * Math.pow(2, this.req.counter), 1000 * 5, 'unshift')
    this.req.counter++
    return retry
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

    // Resume requests that were not completed before disconnect
    for (let i = this.requests.length - 1; i >= 0; i--) {
      const request = this.requests.pop()
      request.resolve(this._retry({}, request.verb, request.query))
    }
  }

  /**
   * Create WebSocket connection
   */
  async _createConnection () {
    const options = this.apiAccessToken ? {
      headers: {
        authorization: `bearer ${this.apiAccessToken}`
      }
    } : {}

    const wss = new WebSocket(this.url, options)
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
    console.log(`Connection received message: ${JSON.stringify(data)}`)

    // Heartbeat
    if (typeof data === 'string' && data.startsWith('primus::ping::')) {
      this.lastHeartbeat = new Date()
      this.connection.send(JSON.stringify(data.replace('ping', 'pong')))
      this.reconnect.counter = 0 // Assume stable connection if heartbeat is received
    }

    // Request
    else if (data.action === 'RES' && data.id) {
      const request = this.requests.find(r => r.id === data.id)
      if (request) {
        this.requests = this.requests.filter(r => r.id === data.id)
        request.resolve(data)
      }
    }

    // Publish
    // TODO: Implement
    else if (data.action === 'PUBLISH') {

    }

    // Unknown message type
    else console.log(`Couldn't process message`)
  }

  /**
   * Handle error responses.
   * It's expected that you override this in a child class for more fine-grained error control.
   * Make sure to reset the delay counter!
   */
  async _errCheck (res, verb, query) {
    // Queued function timed out
    if (typeof res === 'string' && res.includes('timed out')) {
      return this._retry(res, verb, query)
    }

    if (res.body.error) throw res
    else {
      this.req.counter = 0
      return res.body
    }
  }
}

module.exports = Connection
