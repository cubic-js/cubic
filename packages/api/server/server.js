const HTTP = require('./adapters/http.js')
const Ws = require('./adapters/ws.js')
const Cache = require('../middleware/cache.js')
const Logger = require('../middleware/logger.js')
const Redis = require('redis')

class Server {
  constructor (config) {
    this.config = config
    this.cache = new Cache(config, Redis.createClient(config.redisUrl))
    this.logger = new Logger(config)
    this.http = new HTTP(config)
    this.ws = new Ws(config, this.http.server)

    // Make cache and websockets accessible in endpoints
    this.http.endpoints.cache = this.cache
    this.http.endpoints.ws = this.ws
    this.ws.endpoints.cache = this.cache
    this.ws.endpoints.ws = this.ws
  }

  init () {
    this.applyMiddleware()
  }

  applyMiddleware () {
    this.use(this.cache.check.bind(this.cache))

    if (cubic.config.local.logLevel !== 'monitor') {
      this.use(this.logger.log.bind(this.logger))
    }
  }

  use (route, fn, verb) {
    this.http.use(route, fn, verb)
    this.ws.use(route, fn, verb)
  }
}

module.exports = Server
