const Adapter = require('./adapter.js')
const io = require('socket.io')
const URL = require('url')
const Middleware = require('../../middleware/native/sockets.js')

/**
 * Handles all I/O for Socket.io
 */
class SocketAdapter extends Adapter {
  /**
   * Constructs Socket
   */
  constructor (config, server) {
    super(config)

    // Listen on server
    this.io = io.listen(server)

    // Add auth token verification middleware
    const middleware = new Middleware(config)
    this.io.use(middleware.verifySocket.bind(middleware))
    this.use(middleware.verifyExpiration.bind(middleware))

    // Create root namespace
    this.root = this.io.of('/root')
    this.root.use(middleware.verifySocket.bind(middleware))
    this.root.use(middleware.authorizeRoot.bind(middleware))
  }

  /**
   * Run middleware before passing to ReqController
   */
  async prepass (socket, verb, request, ack) {
    // Modify req/res object to allow same middleware approach as in express
    let req = this.convertReq(request, socket, verb)
    let res = this.convertRes(socket, ack)

    let passed = await this.stack.run(req, res)
    if (passed) {
      await this.pass(req, res)
    }
  }

  /**
   * Convert Socket.io request into req-like object
   */
  convertReq (request, socket, verb) {
    if (request) {
      let req = {}
      let url = verb === 'GET' ? request : request.url
      let parsed = URL.parse(`https://blitz.js${url}`, true) // domain is irrelevant

      req.body = request.body
      req.url = url === '' ? '/' : decodeURI(url)
      req.user = socket.user
      req.method = verb
      req.query = parsed.query
      req.params = {} // will get populated on blitz-js-core

      return req
    } else {
      return {}
    }
  }

  /**
   * Convert Socket.io ack callback into res-like object
   */
  convertRes (socket, ack) {
    // Default response value
    let res = {
      statusCode: 200,
      body: ''
    }

    // Socket.io ack passed?
    if (ack) {
      // Send method, invoking client callback with previously customized data
      res.send = (data) => {
        if (!res.sent) {
          res.sent = true
          res.body = data
          ack(res)
        } else {
          // Multi request. No errors will occur but this shouldn't happen
        }
      }
    }

    // Non-ack request
    else {
      // Simple socket emit
      res.send = (data) => {
        res.body = data
        socket.emit('res', res.msg)
      }
    }

    // Apply Status before res.send
    res.status = (code) => {
      res.statusCode = code
      return res
    }
    res.json = (data) => {
      data = JSON.stringify(data)
      return res.send(data)
    }
    res.redirect = (status, data) => {
      status = typeof status === 'number' ? status : 302
      data = typeof status === 'number' ? data : status
      return res.status(status).send(data)
    }
    res.header = () => res
    res.end = (data) => res.send(data)

    // Modified res object
    return res
  }
}

module.exports = SocketAdapter
