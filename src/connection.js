import Auth from './auth.js'
const io = require('socket.io-client')
const queue = require('async-delay-queue')
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
   * Get Tokens and build client
   */
  async connect() {
    return this.auth.authorize().then(() => this.setClient())
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
    this.client.on('disconnect', () => {
      this.reload()
    })

    // Resubscribe after disconnect
    this.resub()
  }

  /**
   * Close existing connection and start new with available tokens
   */
  async reconnect(refresh) {
    this.client.disconnect()
    await this.auth.authorize(refresh)
    this.client.io.opts.query = this.auth.access_token ? 'bearer=' + this.auth.access_token : null
    this.client.connect()
    this.client.once('connect', () => {
      this.reconnecting = Promise.resolve()
    })

    // Retry if server unreachable
    await timeout(() => this.client.connected ? null : this.reload(), 1000)
    await this.reconnecting
  }

  /**
   * Initialize full reset, make sure we don't reconnect multiple times as that
   * would result in a never-ending chain. The `refresh` arg tells if we should
   * use the refresh token or login directly. Will be `true` by default if
   * refresh token is present.
   */
  async reload(refresh) {
    if (!await this.reconnecting) {
      this.reconnecting = this.reconnect(refresh)
    }
    return this.reconnecting
  }

  /**
   * Rejoin Socket.IO subscriptions after connection is lost
   */
  resub() {
    this.client.on('subscribed', sub => {
      if (!this.subscriptions.includes(sub)) this.subscriptions.push(sub)
    })
    this.client.on('connect', () => {
      this.subscriptions.forEach(sub => this.client.emit('subscribe', sub))
    })
  }

  /**
   * Send Request with Err Check
   */
  async request(verb, query) {
    let delay = this.options.ignore_limiter ? 0 : 20
    let res = await this.req(verb, query)
    return this.errCheck(res, verb, query)
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
    let delay = res.body && res.body.reason ? parseInt(res.body.reason.replace(/[^0-9]+/g, '')) : 500
    delay = isNaN(delay) ? 500 : delay
    let reres = await this.queue.delay(() => this.req(verb, query), delay, 30000, 'unshift')
    return this.errCheck(reres, verb, query)
  }

  /**
   * Handles Error Responses
   */
  async errCheck(res = {}, verb, query) {

    // Response not 1xx, 2xx, 3xx?
    if (parseInt(res.statusCode.toString()[0]) > 3) {

      // If expired: Get new token w/ refresh token & retry method
      if (res.body && res.body.reason && res.body.reason.includes('jwt expired')) {
        await this.reload()
        return this.retry(res, verb, query)
      }

      // Rate Limited
      if (res.statusCode === 429 && !this.options.ignore_limiter) {
        return this.retry(res, verb, query)
      }

      // Nodes are busy -> retry
      if (res.statusCode === 503) {
        return this.retry(res, verb, query)
      }

      // Unhandled error
      throw new Error(JSON.stringify(res.body))
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
