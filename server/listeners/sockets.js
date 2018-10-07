const Transformer = require('../transformers/sockets.js')
const transformer = new Transformer()

class SocketsListener {
  constructor (config, adapter, cache) {
    this.config = config
    this.adapter = adapter
    this.cache = cache
  }

  default (socket) {
    // RESTful-like event types
    for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
      socket.on(method, (req, res) => this.pass(socket, method, req, res))
    }

    // Subscriptions
    socket.on('subscribe', endpoint => this.subscribe(endpoint, socket))
    socket.on('unsubscribe', endpoint => this.unsubscribe(endpoint, socket))

    // Connection listeners
    socket.on('disconnect', () => this.disconnect(socket))
    socket.emit('ready')
  }

  root (socket) {
    const node = `${this.config.group ? this.config.group + ' ' : ''}api`.padEnd(10)

    // Subscriptions
    socket.on('subscribe', endpoint => this.subscribe(endpoint, socket))
    socket.on('unsubscribe', endpoint => this.unsubscribe(endpoint, socket))

    // Listen to Updates from core node and publish to subscribers
    socket.on('publish', (update, ack) => {
      cubic.log.verbose(`${node} | > publishing data for ${update.endpoint}`)
      this.adapter.io.to(update.endpoint).emit(update.endpoint, update.data)
      this.adapter.root.to(update.endpoint).emit(update.endpoint, update.data)
      ack(true)
    })

    // Listen for Cache updates
    socket.on('cache', async (data, ack) => {
      await this.cache.save(data.key, data.headers, data.value, data.exp, data.scope)
      ack(true)
    })

    // Connection listeners
    socket.on('disconnect', () => this.disconnect(socket))
    socket.emit('ready')
  }

  pass (socket, method, req, res) {
    req = transformer.convertReq(req, socket, method)
    res = transformer.convertRes(res)
    this.adapter.runMiddleware(req, res)
  }

  subscribe (endpoint, socket) {
    cubic.log.verbose(`Socket.io | ${socket.user.uid} subscribed to ${endpoint}`)
    socket.join(endpoint)
    socket.emit('subscribed', endpoint)
  }

  unsubscribe (endpoint, socket) {
    cubic.log.verbose(`Socket.io | ${socket.user.uid} unsubscribed from ${endpoint}`)
    socket.leave(endpoint)
    socket.emit('unsubscribed', endpoint)
  }

  disconnect (socket) {
    cubic.log.verbose(`Socket.io | ${socket.user.uid} disconnected from ${socket.nsp.name}`)
  }
}

module.exports = SocketsListener
