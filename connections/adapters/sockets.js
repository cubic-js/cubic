const Adapter = require("./adapter.js")
const io = require("socket.io")
const converter = require("../../middleware/socketParser.js")
const Layer = require("../layers.js")

/**
 * Handles all I/O for Socket.io
 */
class SocketAdapter extends Adapter {

    /**
     * Constructs Socket
     */
    constructor(server) {
        super()
        
        // Listen on server
        this.io = io.listen(server)

        // Create root namespace
        this.root = this.io.of("/root")
    }


    /**
     * Run middleware before passing to ReqController
     */
    async prepass(socket, verb, request, ack) {

        // Modify req/res object to allow same middleware approach as in express
        let req = converter.convertReq(request, socket, verb)
        let res = converter.convertRes(socket, ack)
        let layer = new Layer

        await layer.runStack(req, res, this.stack)
        this.pass(req, res)
    }
}

module.exports = SocketAdapter
