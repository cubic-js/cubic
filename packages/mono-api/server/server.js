const HTTP = require('./adapters/http.js')
const Ws = require('./adapters/ws.js')
const Cache = require('../middleware/cache.js')
const Logger = require('../middleware/logger.js')
const Redis = require('redis')

class Server {
  constructor (config) {
    const redis = Redis.createClient(config.redisUrl)
    this.config = config
    this.cache = new Cache(config, redis)
    this.logger = new Logger(config)
    this.http = new HTTP(config, this.cache)
    this.ws = new Ws(config, this.http.server, this.cache)
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
