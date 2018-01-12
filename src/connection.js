import Auth from './auth.js'
const io = require("socket.io-client")
const queue = require("async-delay-queue")
const timeout = (fn, s) => {
  return new Promise(resolve => setTimeout(() => resolve(fn()), s))
}

class Connection {
  constructor(options) {
    this.options = options
    this.subscriptions = []
    this.queue = queue
    this.auth = new Auth(options)
  }

  /**
   * Socket.io client with currently stored tokens
   */
  setClient() {
    let sioConfig = this.auth.access_token ? {
      query: 'bearer=' + this.auth.access_token
    } : {}

    // Connect to parent namespace
    this.client = io.connect(this.options.api_url + this.options.namespace, sioConfig)
    this.client.on("disconnect", () => {
      this.reload()
    })

    // Resubscribe after disconnect
    this.resub()
  }

  /**
   * Get Tokens and build client
   */
  async connect() {
    await this.auth.authorize().then(() => this.setClient())
  }

  /**
   * Close existing connection and start new with available tokens
   */
  async reconnect() {
    this.client.disconnect()
    await this.auth.reauthorize()
    this.client.io.opts.query = this.auth.access_token ? 'bearer=' + this.auth.access_token : null
    this.client.connect()
    this.client.once("connect", () => {
      this.reconnecting = null
    })

    // Retry if server unreachable
    await timeout(() => this.client.connected ? null : this.reload(), 1000)
  }

  /**
   * Initialize full reset
   */
  reload() {
    if (!this.reconnecting) {
      this.reconnecting = this.reconnect()
    }
    return this.reconnecting
  }

  /**
   * Rejoin Socket.IO subscriptions after connection is lost
   */
  resub() {
    this.client.on("subscribed", sub => {
      if (!this.subscriptions.includes(sub)) this.subscriptions.push(sub)
    })
    this.client.on("connect", () => {
      this.subscriptions.forEach(sub => this.client.emit("subscribe", sub))
    })
  }

  /**
   * Send Request with Err Check
   */
  async request(verb, query) {
    let delay = this.options.ignore_limiter ? 0 : 20
    try {
      let res = await this.queue.delay(() => this.req(verb, query), delay)
      return this.errCheck(res, verb, query)
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * Actual Request Code
   */
  async req(verb, query) {
    return new Promise(resolve => this.client.emit(verb, query, resolve))
  }

  /**
   * Retry failed requests
   */
  async retry (res, verb, query) {
    let delay = parseInt(res.body.reason.replace(/[^0-9]+/g, '')) || 500
    let reres = await this.queue.delay(() => this.req(verb, query), delay, 30000, 'unshift')
    return this.errCheck(reres, verb, query)
  }

  /**
   * Handles Error Responses
   */
  async errCheck(res = {}, verb, query) {
    // Response not 1xx, 2xx, 3xx?
    if (res.body && parseInt(res.statusCode.toString()[0]) > 3) {
      // If expired: Get new token w/ refresh token & retry method
      if (typeof res.body === 'string' && res.body.includes('jwt expired')) {
        await this.reload()
        return this.request(verb, query)
      }

      // Error responses may need to be parsed additionally
      try {
        res.body = JSON.parse(res.body)
      } catch (err) {}

      // Rate Limited
      if (res.body.error && res.body.error.includes('Rate limit') && !this.options.ignore_limiter) {
        // Rejection due to frequency
        if (res.body.reason.includes('Request intervals too close')) {
          return this.retry(res, verb, query)
        }

        // Rejection due to empty token bucket
        if (res.body.reason.includes('Max requests per interval reached')) {
          return this.retry(res, verb, query)
        }
      }

      // Nodes are busy -> retry
      else if (typeof res.body === 'string' && res.body.includes('Please try again')) {
        return this.request(verb, query)
      }

      // Unhandled error
      else {
        return res
      }
    }

    // No Error
    else {
      return this.parse(res)
    }
  }

  /**
   * Try to JSON parse the response automatically for convenience
   */
  parse(res) {
    // Is JSON
    try {
      return JSON.parse(res.body)
    }
    // Not JSON, keep original value
    catch (e) {
      return res.body
    }
  }
}

export default Connection
