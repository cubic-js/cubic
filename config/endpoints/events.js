/**
 * Event Configuration for Socket.io Server
 */

module.exports = (sockets) => {
  const cache = cubic.nodes.ui.api.server.cache

  /**
   * Default namespace
   */
  sockets.io.on('connect', socket => {
    socket.on('disconnect', () => {
      cubic.log.verbose('Socket.io | ' + socket.user.uid + ' disconnected from ' + socket.nsp.name)
    })
    socket.emit('ready')
  })

  /**
   * Root namespace
   */
  sockets.root.on('connect', socket => {
    // Listen for Cache updates
    socket.on('cache', async (data, ack) => {
      await cache.save(data.key, data.headers, data.value, data.exp, data.scope)
      ack(true)
    })

    socket.on('disconnect', () => {
      cubic.log.verbose('Socket.io | ' + socket.user.uid + ' disconnected from ' + socket.nsp.name)
    })

    socket.emit('ready')
  })
}
