const WebSocket = require('ws')
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
    this.subscriptions = []
    this.requests = []
    this.requestIds = 1
    this.queue = queue
    this.mutex = new Mutex()

    // Heartbeat check. If the heartbeat takes too long we can assume the connection died.
    setInterval(async () => {
      if (new Date() - this.lastHeartbeat > this.timeout && this.isConnected()) this.connection.close(1001, 'Heartbeat took too long.')
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
    return new Promise((resolve) => {
      const poll = setInterval(() => {
        if (this.connection && this.connection.readyState === state.OPEN) {
          clearInterval(poll)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * Helper function to see if connection is open
   */
  isConnected () {
    return this.connection && this.connection.readyState === state.OPEN
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
        this.connection.emit('error', err)
      }
    })
    return this._errCheck(res, verb, query)
  }

  /**
   * Reload the websocket connection
   */
  async reloadConnection () {
    await this.awaitConnection()
    await this.connection.close(1001, 'Reloading connection.')
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

    await this.awaitConnection()

    // Resume requests that were not completed before disconnect
    for (const req of this.requests) this.request(req.verb, req.query)

    // Re-subscribe
    for (const sub of this.subscriptions) {
      this.connection.send(JSON.stringify({
        action: 'SUBSCRIBE',
        room: sub.room
      }))
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
    wss.onerror = (error) => console.log(`WebSocket Error: ${error.message}`)
    wss.onclose = (close) => { if (close.code !== 1000) this._reconnect() } // Not closed deliberately
    wss.onmessage = (message) => this._onMessage(message.data)
    this.connection = wss
  }

  /**
   * WebSocket message handling
   */
  async _onMessage (data) {
    data = JSON.parse(data)

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
        this.requests = this.requests.filter(r => r.id !== data.id)
        request.resolve(data)
      }
    }

    // Publish to subscriptions
    else if (data.action === 'PUBLISH') {
      for (const sub of this.subscriptions) {
        if (sub.room === data.room) sub.fn(data.data)
      }
    }
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
