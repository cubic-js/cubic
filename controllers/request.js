"use strict"

const endpoints = require("./endpoints.js")

/**
 * Checks request against endpoints given by dbs node
 */
class RequestController {

    /**
     * Connect to databases
     */
    constructor(adapter) {
        this.schema = {
            uat: 0
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
    getResponse(req) {
        return new Promise((resolve, reject) => {

            // Check if Schema requires updating
            endpoints.compareSchema(this.adapter)

            // Verify & Parse request
            let request = endpoints.parse(req, this.schema)

            // Unauthorized
            if (request === "unauthorized") {
                resolve({
                    statusCode: 401,
                    body: "Unauthorized"
                })
            }

            // Params returned
            else if (request) {
                this.send(request)
                    .then(data => {
                        resolve({
                            statusCode: 200,
                            body: data
                        })
                    })
                    .catch(err => {
                        resolve({
                            statusCode: 503,
                            body: err
                        })
                    })
            }

            // No params returned
            else {
                resolve({
                    statusCode: 405,
                    body: "Invalid Request. Refer to api.nexus-stats.com for documentation."
                })
            }
        })
    }


    /**
     * Sends request to connected sockets.
     */
    send(options) {
        return new Promise((resolve, reject) => {

            // Check if nodes available
            this.check()

                // Send request or respond with busy
                .then(socket => this.sendRequest(socket, options))
                .catch(err => reject(err))

                // Respond with data if all went right
                .then(res => resolve(res))
        })
    }


    /**
     * Check if resource nodes are busy
     */
    check() {
        return new Promise((resolve, reject) => {

            // unique callback id
            let id = process.hrtime().join("").toString()

            // Send check to root nsp
            this.client.root.emit("check", id)
            blitz.log.silly("CHK [" + id + "] BROADCAST")

            // Listen to all sockets in root nsp for response
            Object.keys(this.client.root.sockets).forEach(sid => {
                let socket = this.client.root.sockets[sid]

                socket.on(id, () => {
                    socket.removeAllListeners(id)
                    blitz.log.silly("CHK [" + id + "] ACK IN")
                    resolve(socket)
                })
            })

            // Wait 1 second before rejecting
            setTimeout(() => reject("All nodes currently busy. Please try again later."), 1000)
        })
    }


    /**
     * Send request and receive data
     */
    sendRequest(socket, options) {
        return new Promise((resolve, reject) => {

            // Generate unique callback for emit & pass to responding node
            options.callback = process.hrtime().join("").toString()

            // Send Request to all Core Nodes
            this.client.root.emit("req", options)
            blitz.log.silly("REQ [" + options.callback + "] OUT")

            // Listen to all sockets for response
            socket.on(options.callback, data => {
                socket.removeAllListeners(options.callback)
                blitz.log.silly("REQ [" + options.callback + "] SUCCESS")
                resolve(data)
            })
        })
    }
}

module.exports = RequestController