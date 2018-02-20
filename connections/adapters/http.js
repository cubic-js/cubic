const Adapter = require('./adapter.js')
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const Middleware = require('../../middleware/native/express.js')

/**
 * Class describing the logic for handling each incoming request
 */
class HttpAdapter extends Adapter {
  constructor (config) {
    super(config)

    // Load Express
    this.app = express()

    // Start HTTP server.
    this.app.set('port', config.port)
    this.app.use((req, res, next) => {
      res.header("X-powered-by", "Blitz-js")
      next()
    })
    this.app.use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())

    const middleware = new Middleware(config)
    this.app.use(middleware.decode)
    this.app.use(middleware.auth.bind(middleware))
    this.server = http.createServer(this.app)
    this.server.listen(config.port)
  }
}

module.exports = HttpAdapter
