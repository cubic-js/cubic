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

        // Listen to endpoint config event & save in db/memstore
        socket.on("config", endpoints => {
            blitz.log.verbose("API       | < endpoint config")
            sockets.request.endpoints.saveEndpoints(endpoints, sockets)
            http.request.endpoints.saveEndpoints(endpoints, http)
        })

        // Subscriptions
        socket.on("subscribe", endpoint => {
            blitz.log.verbose("Socket.io | " + socket.user.uid + " subscribed to " + endpoint)
            socket.join(endpoint)
            socket.emit("subscribed", endpoint)
        })

        // Listen to Updates from core node and publish to subscribers
        socket.on("publish", update => {
            blitz.log.verbose("API       | > publishing data for " + update.endpoint)
            sockets.io.to(update.endpoint).emit(update.endpoint, update.data)
            sockets.root.to(update.endpoint).emit(update.endpoint, update.data)
        })

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
