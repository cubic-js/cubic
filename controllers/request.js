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

            // Invalid Request
            if (parseInt(request.statusCode.toString()[0]) > 3) {
                resolve(request)
            }

            // Params returned
            else {
                this.send(request)
                    .then(res => resolve(res))
                    .catch(err => {
                        resolve({
                            statusCode: 503,
                            body: err
                        })
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
            this.check(options.file)

                // Send request or respond with busy
                .then(socket => this.request(socket, options))
                .catch(err => reject(err))

                // Respond with data if all went right
                .then(res => resolve(res))
        })
    }


    /**
     * Check if resource nodes are busy
     */
    check(file) {
        return new Promise((resolve, reject) => {

            // unique callback id
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

            // Wait 1 second before rejecting
            setTimeout(() => reject("All nodes currently busy. Please try again later"), blitz.config.api.requestTimeout)
        })
    }


    /**
     * Send request to responding node
     */
    request(socket, options) {
        return new Promise((resolve, reject) => {

            // Generate unique callback for emit & pass to responding node
            options.callback = process.hrtime().join("").toString()

            // Send Request to all Core Nodes
            this.client.root.emit("req", options)
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
