const Adapter = require('./adapter.js')
const io = require('socket.io')
const Middleware = require('../../middleware/native/sockets.js')
const Listener = require('../listeners/sockets.js')

class SocketAdapter extends Adapter {
  constructor (config, server, cache) {
    super(config)
    this.io = io.listen(server)

    // Add auth token verification middleware
    const middleware = new Middleware(config)
    this.io.use(middleware.verifySocket.bind(middleware))
    this.use(middleware.verifyExpiration.bind(middleware))

    this.root = this.io.of('/root')
    this.root.use(middleware.verifySocket.bind(middleware))
    this.root.use(middleware.authorizeRoot.bind(middleware))

    const listener = new Listener(config, this, cache)
    this.io.on('connection', listener.default.bind(listener))
    this.root.on('connection', listener.root.bind(listener))
  }
}

module.exports = SocketAdapter
