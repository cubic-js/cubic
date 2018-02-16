const Adapter = require('./adapter.js')
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const middleware = require('../../middleware/native/express.js')

/**
 * Class describing the logic for handling each incoming request
 */
class HttpAdapter extends Adapter {
  constructor (port) {
    super()

    // Load Express
    this.app = express()

    // Start HTTP server.
    this.app.set('port', port)
    this.app.use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
    this.app.use(middleware.auth)
    this.server = http.createServer(this.app)
    this.server.listen(port)
  }
}

module.exports = HttpAdapter
