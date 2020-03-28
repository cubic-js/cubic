const WebSocket = require('ws')
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
    this.req = { delay: this.options.requestDelay || 500, counter: 0 }
    this.reconnect = { delay: this.options.reconnectDelay || 500, counter: 0 }

    this.lastHeartbeat = new Date()
    this.subscriptions = []
    this.requests = []
    this.retryQueue = []
    this.requestIds = 1
    this.mutex = new Mutex()

    // Heartbeat check. If the heartbeat takes too long we can assume the connection died.
    setInterval(async () => {
      if (new Date() - this.lastHeartbeat > this.timeout && this.isConnected()) this.connection.close(1001, 'Heartbeat took too long.')
    }, this.timeout)

    // Call once to start processing retry queue
    this._processRetryQueue()
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
      if (this.isConnected()) resolve()
      const poll = setInterval(() => {
        if (this.isConnected()) {
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
  async request (verb, query, retry = false) {
    await this.awaitConnection()
    return new Promise((resolve) => {
      const id = this.requestIds++
      const payload = { action: verb, id }
      if (typeof query === 'string') payload.url = query
      else {
        payload.url = query.url
        payload.body = query.body
      }

      this.requests.push({ id, resolve, verb, query, retry })
      try {
        this.connection.send(JSON.stringify(payload))
      } catch (err) {
        this.requests.pop()
        this.connection.emit('error', err)
      }
    })
  }

  /**
   * Reload the websocket connection
   */
  async reloadConnection () {
    await this.awaitConnection()
    await this.connection.close(1001, 'Reloading connection.')
  }

  /**
   * Push a retry into the retry queue
   */
  async retry (req) {
    this.retryQueue.push({
      verb: req.verb,
      query: req.query,
      id: req.retry || req.id, // Use retry id if retrying a retry, otherwise the original id,
      customDelay: req.customDelay || null
    })
  }

  /**
   * Processes the retry queue with the correct delay.
   * Needs to be called once on startup.
   */
  async _processRetryQueue () {
    const currentReqCount = this.req.counter

    const retry = this.retryQueue.shift()
    let customDelay = false
    if (retry) {
      // If theres a custom delay, put back into queue and wait the custom delay
      if (retry.customDelay) {
        customDelay = retry.customDelay
        delete retry.customDelay
        this.retryQueue.unshift(retry)

        // Otherwise make a request
      } else {
        this.request(retry.verb, retry.query, retry.id)
        this.req.counter++
      }
    }

    setTimeout(() => this._processRetryQueue(), customDelay || this.req.delay * Math.pow(2, currentReqCount))
  }

  /**
   * Reconnection logic
   */
  async _reconnect () {
    const release = await this.mutex.acquire()

    // Return if connection is connecting or already open
    if (this.connection && this.connection.readyState <= state.OPEN) {
      release()
      return
    }

    // Wait reconnection delay
    await new Promise((resolve) => setTimeout(() => resolve(), this.reconnect.delay * Math.pow(2, this.reconnect.counter)))
    this.reconnect.counter++
    await this._createConnection()

    release()
  }

  /**
   * Resume requests and rebuild subscriptions
   */
  async _resumeConnection () {
    // Resume requests that were not completed before disconnect
    for (const req of this.requests) this.retry(req)

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
    wss.onopen = () => this._resumeConnection()
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
      this._processResponse(data)
    }

    // Publish to subscriptions
    else if (data.action === 'PUBLISH') {
      for (const sub of this.subscriptions) {
        if (sub.room === data.room) sub.fn(data.data)
      }
    }
  }

  /**
   * Processes incoming request response
   */
  async _processResponse (data) {
    const request = this.requests.find(r => r.id === data.id)
    if (!request) return

    // Retry if error occurred
    const response = await this._errCheck(data, request.verb, request.query)
    if (!response) {
      // Append custom wait delay
      let customDelay = data.body && data.body.reason ? parseInt(data.body.reason.replace(/[^0-9]+/g, '')) : undefined
      request.customDelay = isNaN(customDelay) ? undefined : customDelay

      this.retry(request)
      return
    }

    // Reset req counter and resolve
    this.req.counter = 0
    request.resolve(response)
    const originalRequest = request.retry ? this.requests.find(r => r.id === request.retry) : null
    if (originalRequest) originalRequest.resolve(response)

    // If original request: Filter original request and all that have the original req as retry target
    // If retry request: Filter retried request and all that have the retried req as retry target
    const originalFilter = (r) => r.id !== request.id && r.retry !== request.id
    const retryFilter = (r) => r.id !== request.retry && r.retry !== request.retry
    this.requests = this.requests.filter(!request.retry ? originalFilter : retryFilter)
  }

  /**
   * Handle error responses. Return false on error, otherwise some truthy value.
   * It's expected that you override this in a child class for more fine-grained error control.
   */
  async _errCheck (res, verb, query) {
    if (res.body.error) throw res
    else return res.body
  }
}

module.exports = Connection
