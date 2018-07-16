/**
 * Middleware Functions
 */
const HTTP = require('./adapters/http.js')
const Sockets = require('./adapters/sockets.js')
const Limiter = require('../middleware/limiter.js')
const Cache = require('../middleware/cache.js')
const Logger = require('../middleware/logger.js')
const Redis = require('redis')

/**
 * Procedurally builds up http/sockets server
 */
class Server {
  /**
   * Loads up HTTP/Sockets server and modifies it
   */
  constructor (config) {
    const redis = Redis.createClient(config.redisUrl)
    this.config = config
    this.limiter = new Limiter(config, redis)
    this.cache = new Cache(config, redis)
    this.logger = new Logger(config)
    this.http = new HTTP(config)
    this.sockets = new Sockets(config, this.http.server)
  }

  /**
   * Open up connection listeners
   */
  init () {
    this.setRequestClient()
    this.applyMiddleware()
    this.applyRoutes(this.config)
  }

  /**
   * Applies Middleware to adapters
   */
  applyMiddleware () {
    this.use(this.limiter.check.bind(this.limiter))
    this.use(this.cache.check.bind(this.cache))
    if (cubic.config.local.logLevel !== 'monitor') {
      this.use(this.logger.log.bind(this.logger))
    }
  }

  /**
   * Apply Routes/Events after Middleware for correct order
   */
  applyRoutes (config) {
    require(config.routes)(this.http)
    require(config.events)(this.sockets, config, this.cache)
  }

  /**
   * Loads RequestController into server adapters to process requests to core node
   */
  setRequestClient () {
    this.http.request.client = this.sockets
    this.sockets.request.client = this.sockets
  }

  /**
   * Sets up connection adapter middleware fired on each request
   */
  use (route, fn, verb) {
    this.http.use(route, fn, verb)
    this.sockets.use(route, fn, verb)
  }
}

module.exports = Server
