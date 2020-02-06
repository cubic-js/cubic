const WS = require('ws')
const queue = require('async-delay-queue')

class Client {
  constructor (url, options) {
    this.url = url
    this.options = options
    this.subscriptions = []
    this.queue = queue
    this.delay = options.delay || 500
    this.delayCounter = 0
    this.timeout = 1000 * 15
    this.requestIds = 1
    this.requests = []
    this.connected = false

    // Init heartbeat check. If the heartbeat takes too long
    // we can assume the connection died without an error.
    setInterval(() => {
      if (this.lastHeartbeat && new Date() - this.lastHeartbeat > this.timeout) {
        this.reconnect()
      }
    }, this.timeout)
  }

  /**
   * Get Tokens and build client
   */
  async connect () {
    return this.setConnection(this.setClient())
  }

  /**
   * Helper function to deal with the connection state of the client.
   * this.connecting = initial promise of connection
   * this.resolve = resolve the promise above
   * this.connected = does the client still think it's connected
   */
  async setConnection (promise) {
    if (!this.connecting) this.connecting = promise
    return this.connecting
  }

  /**
   * WS client with currently stored tokens
   */
  setClient () {
    return new Promise(resolve => {
      // Resolve the initial promise, even when reconnecting
      if (!this.resolve) this.resolve = resolve

      const options = this.auth && this.auth.access_token ? {
        headers: {
          authorization: `bearer ${this.auth.access_token}`
        }
      } : {}
      this.client = new WS(this.url, options)
      this.client.on('open', () => {
        this.connected = true
        this.resolve()
        this.resolve = null
        this.connecting = null
      })
      this.client.on('close', e => this.reconnect())
      this.client.on('error', e => this.reconnect())
      this.client.on('message', data => this.onMessage(data))

      // There's a chance the connection attempt gets "lost" when the API server
      // isn't up in time, so just retry if that happens.
      setTimeout(() => {
        if (!this.connected) {
          this.connected = true // reconnect won't run otherwise
          this.reconnect()
        }
      }, 500)
    })
  }

  onMessage (data) {
    data = JSON.parse(data)

    // Heartbeat
    if (typeof data === 'string' && data.startsWith('primus::ping::')) {
      this.lastHeartbeat = new Date()
      this.client.send(JSON.stringify(data.replace('ping', 'pong')))
    }

    // Resolve requests
    else if (data.action === 'RES' && data.id) {
      const i = this.requests.findIndex(r => r.id === data.id)
      const pending = this.requests[i]

      if (pending) {
        pending.resolve(data)
        this.requests.splice(i, 1)
      }
    }

    // Subscriptions
    else if (data.action === 'PUBLISH') {
      for (const sub of this.subscriptions) {
        if (sub.room === data.room) sub.fn(data.data)
      }
    }
  }

  /**
   * Reconnect if connection is lost or the server goes down.
   */
  async reconnect () {
    const delay = (t) => { // Helper function to await time-outed reconnect
      return new Promise((resolve) => {
        setTimeout(() => resolve(), t)
      })
    }
    await delay(this.delay * Math.pow(2, this.delayCounter))
    this.delayCounter++
    await this.reconn()
  }

  /**
   * Actual reconnection logic
   */
  async reconn () {
    // Dont' reconnect multiple times at once
    if (!this.connected) return

    // Browser WS clients may not have this function
    if (this.client.removeAllListeners) {
      this.client.removeAllListeners()
    }
    this.connected = false
    await this.connect()
    this.delayCounter = 0

    // Resume requests that were not completed before the disconnect
    for (let i = 0; this.requests.length; i++) {
      const request = this.requests[0] // always take the first because we'll remove these at the end
      const req = this.req(request.verb, request.query)
      request.resolve(req)
      this.requests.shift()
    }

    // Re-subscribe to rooms
    for (const sub of this.subscriptions) {
      this.client.send(JSON.stringify({
        action: 'SUBSCRIBE',
        room: sub.room
      }))
    }
  }

  /**
   * Send Request with Err Check
   */
  async request (verb, query) {
    let res = await this.req(verb, query)
    return this.errCheck(res, verb, query)
  }

  /**
   * Actual Request Logic
   */
  async req (verb, query) {
    await this.connecting
    return new Promise(resolve => {
      const id = this.requestIds++
      const payload = { action: verb, id }

      if (typeof query === 'string') {
        payload.url = query
      } else {
        payload.url = query.url
        payload.body = query.body
      }
      this.requests.push({ id, resolve, verb, query })

      try {
        this.client.send(JSON.stringify(payload))
      } catch (err) {
        this.client.emit('error', err)
        this.requests.pop()
      }
    })
  }

  /**
   * Retry failed requests
   */
  async retry (res, verb, query) {
    let delay = res.body && res.body.reason ? parseInt(res.body.reason.replace(/[^0-9]+/g, '')) : this.delay
    delay = isNaN(delay) ? this.delay : delay
    let reres = await this.queue.delay(() => this.req(verb, query), delay * Math.pow(2, this.delayCounter), 1000 * 5, 'unshift')
    this.delayCounter++
    return this.errCheck(reres, verb, query)
  }

  /**
   * Handle error responses. It's expected that you override this in a child
   * class for more fine-grained error control.
   * Make sure to reset the delay counter!
   */
  async errCheck (res, verb, query) {
    if (typeof res === 'string' && res.includes('timed out')) {
      return this.retry(res, verb, query)
    }
    if (res.body.error) {
      throw res
    } else {
      this.delayCounter = 0
      return res.body
    }
  }
}

module.exports = Client
