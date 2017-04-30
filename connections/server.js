"use strict"

/**
 * Dependencies
 */
const BlitzUtil = require("blitz-js-util")
const Auth = require('../models/auth.js')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')


/**
 * Middleware
 */
const logger = require('../middleware/logger.js')


/**
 * Express Server for Routing
 */
class Server {

    /**
     * Load up Express
     */
    constructor() {

        // When config received, launch client
        process.on("message", (m) => {

            if (m.global) {

                // Set global blitz object
                BlitzUtil.generateBlitzGlobal(m.global)

                // Build up Server
                this.app = express()
                this.app.set('port', blitz.config.auth.port)
                this.app.use(bodyParser.urlencoded({
                    extended: false
                })).use(bodyParser.json())
                this.http = http.createServer(this.app)
                this.http.listen(blitz.config.auth.port)

                // Load up authentication models
                this.auth = new Auth()

                // Express modifications
                this.configMiddleware()
                this.configRoutes()

                // Log Worker info
                blitz.log.verbose("auth-node worker started [PID: " + process.pid + "]")
            }
        })
    }

    /**
     * Express middleware
     */
    configMiddleware() {
        this.app.use((req, res, next) => logger.log(req, res, next))
    }

    /**
     * Routing
     */
    configRoutes() {
        require(blitz.config.auth.routes)(this.app, this.auth)
    }
}

module.exports = new Server()
