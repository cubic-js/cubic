/**
 * Event Configuration for Socket.io Server
 */

module.exports = (sockets, cache) => {
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
    socket.on('subscribe', endpoint => {
      blitz.log.verbose('Socket.io | ' + socket.user.uid + ' subscribed to ' + endpoint)
      socket.join(endpoint)
      socket.emit('subscribed', endpoint)
    })
    socket.on('unsubscribe', endpoint => {
      blitz.log.verbose('Socket.io | ' + socket.user.uid + ' left ' + endpoint)
      socket.leave(endpoint)
      socket.emit('unsubscribed', endpoint)
    })
    socket.on('disconnect', () => {
      blitz.log.verbose('Socket.io | ' + socket.user.uid + ' disconnected from ' + socket.nsp.name)
    })
    socket.emit('ready')
  })

  /**
   * Root namespace
   */
  sockets.root.on('connect', socket => {
    // Subscriptions
    socket.on('subscribe', endpoint => {
      blitz.log.verbose('Socket.io | ' + socket.user.uid + ' subscribed to ' + endpoint)
      socket.join(endpoint)
      socket.emit('subscribed', endpoint)
    })

    // Listen to Updates from core node and publish to subscribers
    socket.on('publish', update => {
      blitz.log.verbose('API       | > publishing data for ' + update.endpoint)
      sockets.io.to(update.endpoint).emit(update.endpoint, update.data)
      sockets.root.to(update.endpoint).emit(update.endpoint, update.data)
    })

    // Listen for Cache updates
    socket.on('cache', data => {
      cache.save(data.key, data.value, data.exp, data.scope)
    })
    socket.on('disconnect', () => {
      blitz.log.verbose('Socket.io | ' + socket.user.uid + ' disconnected from ' + socket.nsp.name)
    })
    socket.emit('ready')
  })
}
