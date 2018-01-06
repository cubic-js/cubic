/**
 * Event Configuration for Socket.io Server
 */

module.exports = (sockets, cache) => {
  /**
   * Default namespace
   */
  sockets.io.on("connect", socket => {
    socket.on("disconnect", () => {
      blitz.log.verbose("Socket.io | " + socket.user.uid + " disconnected from " + socket.nsp.name)
    })
    socket.emit("ready")
  })

  /**
   * Root namespace
   */
  sockets.root.on("connect", socket => {

    // Listen for Cache updates
    socket.on("cache", data => {
      cache.save(data.key, data.value, data.exp, data.scope)
    })

    socket.on("disconnect", () => {
      blitz.log.verbose("Socket.io | " + socket.user.uid + " disconnected from " + socket.nsp.name)
    })

    socket.emit("ready")
  })
}
