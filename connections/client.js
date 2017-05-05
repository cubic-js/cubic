"use strict"

/**
 * Dependencies
 */
const BlitzUtil = require("blitz-js-util")
const BlitzQuery = require("blitz-js-query")
const MethodHandler = require("../MethodHandler.js")

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

                // Set global blitz object
                BlitzUtil.generateBlitzGlobal(m.global)

                // blitz-js-query options
                let options = {

                    // Connection Settings
                    api_url: blitz.config.core.apiURL,
                    auth_url: blitz.config.core.authURL,
                    use_socket: true,
                    namespace: "root",
                    ignore_limiter: true,

                    // Authentication Settings
                    user_key: blitz.config.core.user_key,
                    user_secret: blitz.config.core.user_secret
                }

                // Connect to api-node
                this.api = new BlitzQuery(options)
                this.api.on("ready", () => {

                    // Listen to incoming requests & send config
                    this.listen()
                    this.sendEndpoints()
                    blitz.log.verbose("core-node worker started [PID: " + process.pid + "]")

                    // Listen on Reconnect
                    this.api.client.on("connect", () => {
                        blitz.log.verbose("core-node worker reconnected to api node")
                        this.sendEndpoints()
                    })
                })
            }
        })
    }


    /**
     * Listen to incoming requests to be processed
     */
    listen() {

        // Tell API node that we"re alive
        this.api.client.on("check", id => {
            blitz.log.silly("CHK [" + id + "] ACK OUT")
            this.api.client.emit(id, "ready")
        })


        // Actual request
        this.api.client.on("req", options => {
            blitz.log.silly("REQ [" + options.callback + "] IN")
            MethodHandler.callMethod(options)

                .then(data => {
                    blitz.log.silly("REQ [" + options.callback + "] RESOLVE")
                    this.api.client.emit(options.callback, data)
                })
                .catch(() => {}) // Just don't respond if file not locally available
        })
    }


    /**
     * Send local endpoints to API node so they get routed
     */
    sendEndpoints() {
        this.api.connection.request("config", MethodHandler.generateEndpointSchema())
    }
}


module.exports = new Client()
