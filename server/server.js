const HTTP = require('./adapters/http.js')
const Sockets = require('./adapters/sockets.js')
const Ws = require('./adapters/ws.js')
const Limiter = require('../middleware/limiter.js')
const Cache = require('../middleware/cache.js')
const Logger = require('../middleware/logger.js')
const Redis = require('redis')

class Server {
  constructor (config) {
    const redis = Redis.createClient(config.redisUrl)
    this.config = config
    this.limiter = new Limiter(config, redis)
    this.cache = new Cache(config, redis)
    this.logger = new Logger(config)
    this.http = new HTTP(config)
    this.sockets = new Sockets(config, this.http.server, this.cache)
    this.ws = new Ws(config, this.http.server, this.cache)
  }

  init () {
    this.setRequestClient()
    this.applyMiddleware()
  }

  setRequestClient () {
    this.http.request.client = this.ws
    this.sockets.request.client = this.ws
    this.ws.request.client = this.ws
  }

  applyMiddleware () {
    this.use(this.limiter.check.bind(this.limiter))
    this.use(this.cache.check.bind(this.cache))

    if (cubic.config.local.logLevel !== 'monitor') {
      this.use(this.logger.log.bind(this.logger))
    }
  }

  /**
   * Adds new middleware to each adapter.
   */
  use (route, fn, verb) {
    this.http.use(route, fn, verb)
    this.sockets.use(route, fn, verb)
    this.ws.use(route, fn, verb)
  }
}

module.exports = Server
