"use strict"


/**
 * Middleware Functions
 */
const bodyParser = require("body-parser")
const auth = require("../middleware/auth.js")
const parser = require("../middleware/requestParser.js")
const limit = require("../middleware/limiter.js")
const logger = require("../middleware/logger.js")


/**
 * Procedurally builds up http/sockets server
 */
class Server {

    /**
     * Loads up HTTP/Sockets server and modifies it
     */
    constructor() {

        // Build up Server
        this.setupHttpServer()
        this.setupSockets()
        this.setupCache()

        // Config Express & Sockets.io
        this.applyMiddleware()
        this.applyRoutes()
        this.setRequestClient()

        // Log Worker info
        blitz.log.verbose("api-node worker connected")
    }


    /**
     * Loads up instance of the http class including an express http server
     */
    setupHttpServer() {
        this.http = new(require("./adapters/http.js"))(blitz.config.api.port)
    }


    /**
     * Lets Socket.io connect to previously set up http server
     */
    setupSockets() {
        this.sockets = new(require("./adapters/sockets.js"))(this.http.server)
    }


    /**
     * Load Cache Controller
     */
    setupCache() {
        this.cache = require("../controllers/cache.js")
    }


    /**
     * Applies Middleware to adapters
     */
    applyMiddleware() {

        // Use BodyParser for Express
        this.http.app.use(bodyParser.urlencoded({
                extended: false
            }))
            .use(bodyParser.json())

        // Enable JWT auth (native middleware)
        auth.configExpress(this.http.app)
        auth.configSockets(this.sockets)

        // Parse URL Request into JSON Object
        this.use((req, res, next) => parser.parse(req, res, next))

        // Use custom Logger for i/o
        if (blitz.config.api.useRequestLogger) {
            this.use((req, res, next) => logger.log(req, res, next))
        }

        // Get response from cache if available
        this.use((req, res, next) => this.cache.check(req, res, next))

        // Rolling Rate Limit
        if (blitz.config.api.useRateLimiter) {
            this.use((req, res, next) => limit.check(req, res, next))
        }
    }


    /**
     * Apply Routes/Events after Middleware for correct order
     */
    applyRoutes() {
        require(blitz.config.api.routes)(this.http)
        require(blitz.config.api.events)(this.sockets, this.http, this.cache)
    }


    /**
     * Loads RequestController into server adapters to process requests to core node
     */
    setRequestClient() {
        this.http.request.client = this.sockets
        this.sockets.request.client = this.sockets
    }


    /**
     * Sets up connection adapter middleware fired on each request
     */
    use(route, fn, verb) {
        this.http.use(route, fn, verb)
        this.sockets.use(route, fn, verb)
    }
}

module.exports = Server
