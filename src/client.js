const WS = require('ws')
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
    return new Promise(resolve => {
      const options = this.auth && this.auth.access_token ? {
        headers: {
          authorization: `bearer ${this.auth.access_token}`
        }
      } : {}
      this.client = new WS(this.url, options)
      this.client.on('open', resolve) // fire subscriptions
      this.client.on('close', e => this.reconnect())
      this.client.on('error', e => e.code !== 'ECONNREFUSED' || this.reconnect())

      // Message handling. Mostly internal stuff with primus.
      this.client.on('message', data => {
        data = JSON.parse(data)

        // Heartbeat
        if (typeof data === 'string' && data.startsWith('primus::ping::')) {
          this.client.send(JSON.stringify(data.replace('ping', 'pong')))
        }

        // Resolve requests
        else if (data.id) {
          const pending = this.requests.find(r => r.id === data.id)
          if (pending) pending.resolve(data)
        }
      })
    })
  }

  /**
   * Reconnect if connection is lost or the server goes down.
   */
  reconnect () {
    this.client.removeAllListeners()
    this.connect()
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
