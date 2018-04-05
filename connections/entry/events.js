/**
 * Event Configuration for Socket.io Server
 */
const Cache = require('../../middleware/cache.js')

// Subscriptions
function subscribe(endpoint, socket) {
  cubic.log.verbose(`Socket.io | ${socket.user.uid} subscribed to ${endpoint}`)
  socket.join(endpoint)
  socket.emit('subscribed', endpoint)
}
function unsubscribe(endpoint, socket) {
  cubic.log.verbose(`Socket.io | ${socket.user.uid} unsubscribed from ${endpoint}`)
  socket.leave(endpoint)
  socket.emit('unsubscribed', endpoint)
}

// Disconnect message
function disconnect(socket) {
  cubic.log.verbose(`Socket.io | ${socket.user.uid} disconnected from ${socket.nsp.name}`)
}

module.exports = (sockets, config) => {
  const cache = new Cache(config)
  const node = `${config.group ? config.group + ' ' : ''}api`.padEnd(10)

  /**
   * Default namespace
   */
  sockets.io.on('connect', socket => {
    // RESTful-like event types
    socket.on('GET', (req, res) => sockets.prepass(socket, 'GET', req, res))
    socket.on('POST', (req, res) => sockets.prepass(socket, 'POST', req, res))
    socket.on('PUT', (req, res) => sockets.prepass(socket, 'PUT', req, res))
    socket.on('PATCH', (req, res) => sockets.prepass(socket, 'PATCH', req, res))
    socket.on('DELETE', (req, res) => sockets.prepass(socket, 'DELETE', req, res))

    // Subscriptions
    socket.on('subscribe', endpoint => subscribe(endpoint, socket))
    socket.on('unsubscribe', endpoint => unsubscribe(endpoint, socket))

    // Connection listeners
    socket.on('disconnect', () => disconnect(socket))
    socket.emit('ready')
  })

  /**
   * Root namespace
   */
  sockets.root.on('connect', socket => {
    // Subscriptions
    socket.on('subscribe', endpoint => subscribe(endpoint, socket))
    socket.on('unsubscribe', endpoint => unsubscribe(endpoint, socket))

    // Listen to Updates from core node and publish to subscribers
    socket.on('publish', update => {
      cubic.log.verbose(`${node} | > publishing data for ${update.endpoint}`)
      sockets.io.to(update.endpoint).emit(update.endpoint, update.data)
      sockets.root.to(update.endpoint).emit(update.endpoint, update.data)
      socket.emit(update.id, 'done')
    })

    // Listen for Cache updates
    socket.on('cache', async data => {
      await cache.save(data.key, data.value, data.exp, data.scope)
      socket.emit(data.id, 'done')
    })

    // Connection listeners
    socket.on('disconnect', () => disconnect(socket))
    socket.emit('ready')
  })
}
