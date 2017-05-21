/**
 * Event Configuration for Socket.io Server
 */

module.exports = (sockets, http, cache) => {

    /**
     * Default namespace
     */
    sockets.io.on("connect", socket => {

        // RESTful-like event types
        socket.on("GET", (req, res) => sockets.prepass(socket, "GET", req, res))
        socket.on("POST", (req, res) => sockets.prepass(socket, "POST", req, res))
        socket.on("PUT", (req, res) => sockets.prepass(socket, "PUT", req, res))
        socket.on("DELETE", (req, res) => sockets.prepass(socket, "DELETE", req, res))

        // Subscriptions
        socket.on("subscribe", endpoint => {
            blitz.log.verbose("Socket.io | " + socket.user.uid + " subscribed to " + endpoint)
            socket.join(endpoint)
            socket.emit("subscribed", endpoint)
        })

        socket.on("disconnect", () => {
            blitz.log.verbose("Socket.io | " + socket.user.uid + " disconnected from " + socket.nsp.name)
        })
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

        // Listen to Updates from core node and publish to subscribers
        socket.on("publish", update => {
            blitz.log.verbose("API       | > publishing data for " + update.endpoint)
            sockets.io.to(update.endpoint).emit("new", update)
        })

        // Listen for Cache updates
        socket.on("cache", data => {
            blitz.log.verbose("API       | < caching data for " + data.key)
            cache.save(data.key, data.value, data.exp)
        })

        socket.on("disconnect", () => {
            blitz.log.verbose("Socket.io | " + socket.user.uid + " disconnected from " + socket.nsp.name)
        })
    })
}
