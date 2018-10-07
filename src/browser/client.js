const queue = require('async-delay-queue')

class Client {
  constructor (url, options) {
    this.url = url
    this.options = options
    this.subscriptions = []
    this.queue = queue
    this.requestIds = 1
    this.requests = []
  }

  /**
   * Get Tokens and build client
   */
  async connect () {
    await this.setClient()
  }

  /**
   * WS client with currently stored tokens
   */
  setClient () {
    const WS = WebSocket
    this.connecting = new Promise(resolve => {
      const url = this.auth && this.auth.acess_token
        ? `${this.url}?bearer=${this.auth.access_token}`
        : this.url
      this.client = new WS(url)
      this.client.onopen = resolve
      this.client.onclose = e => this.reconnect()
      this.client.onerror = e => e.code !== 'ECONNREFUSED' || this.reconnect()

      // Message handling. Mostly internal stuff with primus.
      this.client.onmessage = data => {
        data = JSON.parse(data.data)

        // Heartbeat
        if (typeof data === 'string' && data.startsWith('primus::ping::')) {
          this.client.send(JSON.stringify(data.replace('ping', 'pong')))
        }

        // Resolve requests
        else if (data.action === 'RES' && data.id) {
          const pending = this.requests.find(r => r.id === data.id)
          if (pending) pending.resolve(data)
        }

        // Subscriptions
        else if (data.action === 'PUBLISH') {
          const sub = this.subscriptions.find(s => s.room === data.room)
          sub.fn(data.data)
        }
      }
    })
    return this.connecting
  }

  /**
   * Reconnect if connection is lost or the server goes down.
   */
  async reconnect () {
    this.client.removeAllListeners()
    await this.connect()

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
      this.requests.push({ id, resolve })

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
    let delay = res.body && res.body.reason ? parseInt(res.body.reason.replace(/[^0-9]+/g, '')) : 500
    delay = isNaN(delay) ? 500 : delay
    let reres = await this.queue.delay(() => this.req(verb, query), delay, 30000, 'unshift')
    return this.errCheck(reres, verb, query)
  }

  /**
   * Handle error responses. It's expected that you override this in a child
   * class for more fine-grained error control.
   */
  async errCheck (res, verb, query) {
    if (res.body.error) {
      throw res
    } else {
      return res.body
    }
  }
}

export default Client
