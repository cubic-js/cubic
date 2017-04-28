"use strict"

/**
 * Dependencies
 */
const Blitz = require("../controllers/blitz.js")
const BlitzQuery = require('blitz-js-query')
const MethodHandler = require('../MethodHandler.js')

/**
 * Connects to local API Node & handles basic cycles
 */
class Client {

    /**
     * Connect to blitz.js API node
     */
    constructor() {

        // When config received, launch client
        process.on("message", (m) => {

            if (m.global) {

                new Blitz(m.global)

                // blitz-js-query options
                let options = {

                    // Connection Settings
                    api_url: blitz.config.core.apiURL,
                    auth_url: blitz.config.core.authURL,
                    use_socket: true,
                    namespace: 'root',
                    ignore_limiter: true,

                    // Authentication Settings
                    user_key: blitz.config.core.user_key,
                    user_secret: blitz.config.core.user_secret
                }

                // Connect to api-node
                this.api = new BlitzQuery(options)
                this.api.on('ready', () => {

                    this.listen()
                    this.sendEndpoints()

                    // Log Worker info
                    blitz.log.verbose("core-node worker started [PID: " + process.pid + "]")
                })
            }
        })
    }


    /**
     * Listen to incoming requests to be processed
     */
    listen() {
        this.api.client.on('req', options => {
             MethodHandler.callMethod(options)
                 .then(data => this.api.client.emit(options.callback, data))
                 .catch(() => {}) // Just don't respond if file not locally available
        })
    }


    /**
     * Send local endpoints to API node so they get routed
     */
    sendEndpoints() {
        this.api.connection.request('config', MethodHandler.generateEndpointSchema())
    }
}


module.exports = new Client()
