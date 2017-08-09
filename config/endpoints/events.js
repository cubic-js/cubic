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
        socket.on("PATCH", (req, res) => sockets.prepass(socket, "PATCH", req, res))
        socket.on("DELETE", (req, res) => sockets.prepass(socket, "DELETE", req, res))

        // Subscriptions
        socket.on("subscribe", endpoint => {
            endpoint = endpoint.toLowerCase()
            blitz.log.verbose("Socket.io | " + socket.user.uid + " subscribed to " + endpoint)
            socket.join(endpoint)
            socket.emit("subscribed", endpoint)
        })

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
            endpoint = endpoint.toLowerCase()
            blitz.log.verbose("Socket.io | " + socket.user.uid + " subscribed to " + endpoint)
            socket.join(endpoint)
            socket.emit("subscribed", endpoint)
        })

        // Listen to Updates from core node and publish to subscribers
        socket.on("publish", update => {
            let endpoint = update.endpoint.toLowerCase()
            blitz.log.verbose("API       | > publishing data for " + endpoint)
            sockets.io.to(endpoint).emit(update.endpoint, update.data)
            sockets.root.to(endpoint).emit(update.endpoint, update.data)
        })

        // Listen for Cache updates
        socket.on("cache", data => {
            cache.save(data.key, data.value, data.exp)
        })

        socket.on("disconnect", () => {
            blitz.log.verbose("Socket.io | " + socket.user.uid + " disconnected from " + socket.nsp.name)
        })

        socket.emit("ready")
    })
}
