/**
 * Event Configuration for Socket.io Server
 */

module.exports = (sockets, http) => {

    /**
     * Default namespace
     */
    sockets.io.on('connection', socket => {

        // RESTful-like event types
        socket.on('GET', (req, res) => sockets.prepass(socket, 'GET', req, res))
        socket.on('POST', (req, res) => sockets.prepass(socket, 'POST', req, res))
        socket.on('PUT', (req, res) => sockets.prepass(socket, 'PUT', req, res))
        socket.on('DELETE', (req, res) => sockets.prepass(socket, 'DELETE', req, res))

        // Subscriptions
        socket.on("SUBSCRIBE", endpoint => socket.join(endpoint))
    })


    /**
     * Root namespace
     */
    sockets.root.on('connection', socket => {

        // Listen to endpoint config event & save in db/memstore
        socket.on('config', (endpoints) => {
            sockets.request.endpoints.saveEndpoints(endpoints, sockets)
            http.request.endpoints.saveEndpoints(endpoints, http)
        })

        // Listen to Updates from core node and publish to subscribers
        socket.on('PUBLISH', update => {
            sockets.io.to(update.endpoint).emit("UPDATE", update)
        })
    })
}
