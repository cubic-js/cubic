/**
 * Middleware Functions
 */
const HTTP = require('./adapters/http.js')
const Io = require('./adapters/sockets.js')
const cache = require('../middleware/cache.js')
const logger = require('../middleware/logger.js')

/**
 * Procedurally builds up http/sockets server
 */
class Server {
  /**
   * Loads up HTTP/Sockets server and modifies it
   */
  constructor (port) {
    // Build up Server
    this.http = new HTTP(port)
    this.sockets = new Io(this.http.server)

    // Config Express & Sockets.io
    this.setRequestClient()
    this.applyMiddleware()
    this.applyRoutes()
  }

  /**
   * Applies Middleware to adapters
   */
  applyMiddleware () {
    // Use custom Logger for i/o
    if (blitz.config[blitz.id].useRequestLogger) {
      this.use(logger.log)
    }

    // Get response from cache if available
    this.use(cache.check)
  }

  /**
   * Apply Routes/Events after Middleware for correct order
   */
  applyRoutes () {
    require(blitz.config[blitz.id].routes)(this.http)
    require(blitz.config[blitz.id].events)(this.sockets)
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
