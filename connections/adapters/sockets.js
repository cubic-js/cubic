const Adapter = require('./adapter.js')
const io = require('socket.io')
const middleware = require('../../middleware/native/sockets.js')
const Layer = require('../layers.js')

/**
 * Handles all I/O for Socket.io
 */
class SocketAdapter extends Adapter {
  /**
   * Constructs Socket
   */
  constructor (server) {
    super()

    // Listen on server
    this.io = io.listen(server)

    // Add auth token verification middleware
    this.io.use(middleware.verifySocket)
    this.use(middleware.verifyExpiration)

    // Create root namespace
    this.root = this.io.of('/root')
    this.root.use(middleware.verifySocket)
    this.root.use(middleware.authorizeRoot)
  }

  /**
   * Run middleware before passing to ReqController
   */
  async prepass (socket, verb, request, ack) {
    // Modify req/res object to allow same middleware approach as in express
    let req = converter.convertReq(request, socket, verb)
    let res = converter.convertRes(socket, ack)
    let layer = new Layer()

    try {
      await layer.runStack(req, res, this.stack)
      this.pass(req, res)
    } catch(err) {}
  }

  /**
   * Convert Socket.io request into req-like object
   */
  convertReq (request, socket, verb) {
    if (request) {
      let req = {}
      let url = verb === 'GET' ? request : request.url

      req.body = request.body
      req.url = url
      req.user = socket.user
      req.method = verb
      req.channel = 'Sockets'
      req.query = {}
      req.params = {}

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

      // Apply Status before res.send
      res.status = (code) => {
        res.statusCode = code
        return res
      }

      // Pseudo res.json to stay parallel with express
      res.json = (data) => {
        data = JSON.stringify(data)
        return res.send(data)
      }

      res.redirect = (status, data) => {
        status = typeof status === 'number' ? status : 302
        data = typeof status === 'number' ? data : status
        return res.status(status).send(data)
      }
    }

    // Non-ack request
    else {
      // Simple socket emit
      res.send = (data) => {
        res.body = data
        socket.emit('res', res.msg)
      }

      // Apply Status before res.send
      res.status = (code) => {
        res.statusCode = code
        return res
      }

      // Pseudo res.json to stay parallel with express
      res.json = (data) => {
        data = JSON.stringify(data)
        return res.send(data)
      }
    }

    // Modified res object
    return res
  }
}

module.exports = SocketAdapter
