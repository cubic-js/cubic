const Adapter = require('./adapter.js')
const express = require('express')
const http = require('http')

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
    this.server = http.createServer(this.app)
    this.server.listen(port)
  }
}

module.exports = HttpAdapter
