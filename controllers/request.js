const endpoints = require("./endpoints.js")
const timeout = (fn, s) => {
    return new Promise(resolve => setTimeout(() => resolve(fn()), s))
}

/**
 * Checks request against endpoints given by dbs node
 */
class RequestController {

    /**
     * Connect to databases
     */
    constructor(adapter) {
        this.schema = {
            uat: 0,
            endpoints: []
        }
        this.endpoints = endpoints
        this.adapter = adapter

        // Load endpoint config directly on bootup
        this.endpoints.connect()
            .then(() => this.endpoints.compareSchema(this.adapter))
    }


    /**
     * Controls Request processing
     */
    async getResponse(req) {
        // Check if Schema requires updating
        endpoints.compareSchema(this.adapter)

        // Verify & Parse request
        let request = endpoints.parse(req, this.schema)

        // Invalid Request
        if (parseInt(request.statusCode.toString()[0]) > 3) {
            return request
        }

        // Params returned
        else {
            return await this.send(request)
        }
    }


    /**
     * Sends request to connected sockets.
     */
    async send(options) {
        try {
            let socket = await this.check(options.file)
            return this.request(socket, options)
        }

        // No socket responded (file not available or cannot be reached)
        catch (err) {
            return {
                statusCode: 503,
                body: err
            }
        }
    }


    /**
     * Check if resource nodes are busy
     */
    check(file) {
        return new Promise((resolve, reject) => {
            let request = {
                id: process.hrtime().join("").toString(),
                file: file
            }

            // Send check to root nsp
            this.client.root.emit("check", request)
            blitz.log.silly("API       | Check broadcasted")

            // Listen to all sockets in root nsp for response
            Object.keys(this.client.root.sockets).forEach(sid => {
                let socket = this.client.root.sockets[sid]
                socket.once(request.id, () => {
                    blitz.log.silly("API       | Check acknowledged")
                    resolve(socket)
                })
            })

            // Wait before rejecting
            setTimeout(() => reject("All nodes currently busy. Please try again later"), blitz.config[blitz.id].requestTimeout)
        })
    }


    /**
     * Send request to responding node
     */
    async request(socket, options) {
        return new Promise((resolve, reject) => {

            // Generate unique callback for emit & pass to responding node
            options.callback = process.hrtime().join("").toString()

            // Send Request to all Core Nodes
            socket.emit("req", options)
            blitz.log.silly("API       | Request sent")

            // Listen to all sockets for response
            socket.once(options.callback, data => {
                blitz.log.silly("API       | Request successful - Sending data to client")
                resolve(data)
            })
        })
    }
}

module.exports = RequestController
