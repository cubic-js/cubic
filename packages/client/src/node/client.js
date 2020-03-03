const WS = require('ws')
const queue = require('async-delay-queue')

class Client {
  constructor (url, options) {
    this.url = url
    this.options = options
    this.states = {
      disconnected: 'disconnected',
      connected: 'connected',
      connecting: 'connecting',
      reconnecting: 'reconnecting'
    }
    this.state = this.states.disconnected
    this.subscriptions = []
    this.queue = queue
    this.requestDelay = options.requestDelay || options.delay || 500 // options.delay for backwards compatible reasons
    this.connectionTimeout = options.connectionTimeout || 500
    this.reconnectCounter = 0
    this.reRequestCounter = 0
    this.timeout = options.timeout || 1000 * 10
    this.requestIds = 1
    this.requests = []

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
    switch (this.state) {
      case 'disconnected':
      case 'reconnecting':
      case 'connected':
        this.setClient()
        this.state = this.states.connecting
        try {
          await this._connecting()
          return
        } catch (e) {
          return this.reconnect()
        }
      default:
        break
    }
  }

  close () {
    // Browser WS clients may not have this function
    if (this.client.removeAllListeners) {
      this.client.removeAllListeners()
    }
    if (this.client.readyState === 1) {
      this.client.close()
    }
  }

  /**
   * Helper function to get current connection state
   */
  async _connecting () {
    if (this.state === this.states.connected) return

    return new Promise(resolve => {
      let i = setInterval(() => {
        if (this.state === this.states.connected) {
          clearInterval(i)
          resolve()
        }
      }, 50)
    })
  }

  /**
   * WS client with currently stored tokens
   */
  async setClient () {
    const options = this.auth && this.auth.access_token ? {
      headers: {
        authorization: `bearer ${this.auth.access_token}`
      }
    } : {}
    this.client = new WS(this.url, options)
    this.client.on('open', () => {
      this.state = this.states.connected
      this.reconnectCounter = 0
    })
    this.client.on('close', () => {
      this.state = this.states.disconnected
      this.reconnect()
    })
    this.client.on('error', e => {
      this.state = this.states.disconnected
      this.reconnect()
    })
    this.client.on('message', data => this.onMessage(data))

    // There's a chance the connection attempt gets "lost" when the API server
    // isn't up in time, so just retry if that happens.
    return new Promise(resolve => {
      setTimeout(async () => {
        switch (this.state) {
          case 'disconnected':
          case 'reconnecting':
          case 'connecting':
            await this.reconnect()
            resolve()
            break
          case 'connected':
          default:
            resolve()
            break
        }
      }, 500)
    })
  }

  /**
   * Reconnect if connection is lost or the server goes down.
   */
  async reconnect () {
    if (this.state === this.states.reconnecting) return
    this.state = this.states.reconnecting
    if (this.reconnectCounter > 0) await new Promise(resolve => setTimeout(resolve, this.connectionTimeout * Math.pow(2, this.reconnectCounter - 1)))
    this.reconnectCounter++
    this.close()
    await this.connect()
    this.resumeRequests()
    this.reSubscribe()
  }

  resumeRequests () {
    for (let i = 0; this.requests.length; i++) {
      const request = this.requests[0] // always take the first because we'll remove these at the end
      const req = this._request(request.verb, request.query)
      request.resolve(req)
      this.requests.shift()
    }
  }

  reSubscribe () {
    for (const sub of this.subscriptions) {
      this.client.send(JSON.stringify({
        action: 'SUBSCRIBE',
        room: sub.room
      }))
    }
  }

  onMessage (data) {
    this.state = this.states.connected
    this.reconnectCounter = 0
    data = JSON.parse(data)

    // Technically we receive a hello on handshake
    // but connected state is set on all messages

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
   * Send Request with Err Check
   */
  async request (verb, query) {
    let res = await this._request(verb, query)
    return this.errCheck(res, verb, query)
  }

  /**
   * Actual Request Logic
   */
  async _request (verb, query) {
    await this._connecting()
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
    let delay = res.body && res.body.reason ? parseInt(res.body.reason.replace(/[^0-9]+/g, '')) : this.requestDelay
    delay = isNaN(delay) ? this.requestDelay : delay
    let retry = await this.queue.delay(() => this._request(verb, query), delay * Math.pow(2, this.reRequestCounter), 1000 * 5, 'unshift')
    this.reRequestCounter++
    return this.errCheck(retry, verb, query)
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
      this.reRequestCounter = 0
      return res.body
    }
  }
}

module.exports = Client
