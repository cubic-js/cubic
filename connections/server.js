/**
 * Middleware Functions
 */
const HTTP = require('./adapters/http.js')
const Io = require('./adapters/sockets.js')
const Cache = require('../middleware/cache.js')
const logger = require('../middleware/logger.js')

/**
 * Procedurally builds up http/sockets server
 */
class Server {
  /**
   * Loads up HTTP/Sockets server and modifies it
   */
  constructor (id) {
    this.http = new HTTP(blitz.config[id].port)
    this.sockets = new Io(this.http.server)
    this.cache = new Cache(id)
    this.setRequestClient()
    this.applyMiddleware()
    this.applyRoutes(id)
  }

  /**
   * Applies Middleware to adapters
   */
  applyMiddleware () {
    this.use(logger.log)
    this.use(this.cache.check)
  }

  /**
   * Apply Routes/Events after Middleware for correct order
   */
  applyRoutes (id) {
    require(blitz.config[id].routes)(this.http)
    require(blitz.config[id].events)(this.sockets, id)
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
