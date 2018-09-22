import Auth from './auth.js'
import ServerError from './serverError.js'
const io = require('socket.io-client')
const queue = require('async-delay-queue')
const timeout = (fn, s) => {
  return new Promise(resolve => setTimeout(() => resolve(fn()), s))
}

class Connection {
  constructor (options) {
    this.options = options
    this.subscriptions = []
    this.queue = queue
    this.auth = new Auth(options)
  }

  /**
   * Get Tokens and build client
   */
  async connect () {
    await this.auth.authorize()
    await this.setClient()
  }

  /**
   * Socket.io client with currently stored tokens
   */
  async setClient (skipListeners) {
    let sioConfig = this.auth.access_token ? {
      query: 'bearer=' + this.auth.access_token
    } : {}

    // Connect to parent namespace
    this.client = io.connect(this.options.api_url + this.options.namespace, sioConfig)

    // Event listeners
    if (!skipListeners) {
      this.client.on('error', () => this.reload())
      this.client.on('connect_error', () => this.reload())
      this.client.on('disconnect', () => this.reload())
      this.client.on('connect', () => {
        this.reconnecting = false
        this.subscriptions.forEach(sub => this.client.emit('subscribe', sub))
      })
      this.client.on('subscribed', sub => {
        if (!this.subscriptions.includes(sub)) this.subscriptions.push(sub)
      })
    }

    await timeout(() => {
      if (!this.client.connected) this.setClient(true)
    }, 1000)
  }

  /**
   * Close existing connection and start new with available tokens
   */
  async reconnect (refresh) {
    this.reconnecting = true
    this.client.disconnect()
    await this.auth.authorize(refresh)
    this.client.io.opts.query = this.auth.access_token ? 'bearer=' + this.auth.access_token : null
    this.client.connect()

    // Retry if server unreachable. Usual reconnect takes less than 100ms, so 1s
    // should be more than plenty.
    await timeout(async () => {
      if (!this.client.connected) {
        this.reconnecting = false
        this.reload()
      }
    }, 1000)
  }

  /**
   * Initialize full reset, make sure we don't reconnect multiple times as that
   * would result in a never-ending chain. The `refresh` arg tells if we should
   * use the refresh token or login directly. Will be `true` by default if
   * refresh token is present.
   */
  async reload (refresh) {
    if (!this.reconnecting) {
      await this.reconnect(refresh)
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
   * Actual Request Code
   */
  async req (verb, query) {
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
  async errCheck (res = {}, verb, query) {
    // If expired: Get new token w/ refresh token & retry method
    if (res.body && res.body.reason && res.body.reason.includes('jwt expired')) {
      await this.reload()
      return this.retry(res, verb, query)
    }

    // Rate Limited
    if (res.statusCode === 429) {
      return this.retry(res, verb, query)
    }

    // Nodes are busy -> retry
    if (res.statusCode === 503) {
      return this.retry(res, verb, query)
    }

    // Redirect. Assume res.body is redirect link
    if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
      return this.retry(res, verb, res.body)
    }

    // Unhandled error
    if (parseInt(res.statusCode.toString()[0]) > 3) {
      throw new ServerError(res, query)
    }

    // No Error
    return res.body
  }
}

export default Connection
