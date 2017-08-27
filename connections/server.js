/**
 * Middleware Functions
 */
const HTTP = require('./adapters/http.js')
const Io = require('./adapters/sockets.js')
const Cache = require('../controllers/cache.js')
const bodyParser = require('body-parser')
const auth = require('../middleware/auth.js')
const limit = require('../middleware/limiter.js')
const logger = require('../middleware/logger.js')

/**
 * Procedurally builds up http/sockets server
 */
class Server {
  /**
   * Loads up HTTP/Sockets server and modifies it
   */
  constructor () {
    // Build up Server
    this.http = new HTTP(blitz.config[blitz.id].port)
    this.sockets = new Io(this.http.server)
    this.cache = new Cache()

    // Config Express & Sockets.io
    this.setRequestClient()
    this.applyMiddleware()
    this.applyRoutes()
  }

  /**
   * Applies Middleware to adapters
   */
  applyMiddleware () {

    // Use BodyParser for Express
    this.http.app.use(bodyParser.urlencoded({
      extended: true
    }))
      .use(bodyParser.json())

    // Enable JWT auth (native middleware)
    auth.configExpress(this.http.app)
    auth.configSockets(this.sockets)

    // Use custom Logger for i/o
    if (blitz.config[blitz.id].useRequestLogger) {
      this.use((req, res, next) => logger.log(req, res, next))
    }

    // Get response from cache if available
    this.use((req, res, next) => this.cache.check(req, res, next))

    // Rolling Rate Limit
    if (blitz.config[blitz.id].limiter.enabled) {
      this.use((req, res, next) => limit.check(req, res, next))
    }
  }

  /**
   * Allow appending native express middleware before custom adatper routes
   */
  appendMiddleware (fn) {
    this.http.app._router.stack.pop()
    this.http.app.use(fn)
    this.applyRoutes()
  }

  /**
   * Apply Routes/Events after Middleware for correct order
   */
  applyRoutes () {
    require(blitz.config[blitz.id].routes)(this.http)
    require(blitz.config[blitz.id].events)(this.sockets, this.cache)
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
