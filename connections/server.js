"use strict"

/**
 * Dependencies
 */
const Auth = require('../models/auth.js')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const Purge = require("../tasks/purge.js")


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
        this.configTasks()

        // Log Worker info
        blitz.log.verbose("auth-node worker started")
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

    /**
     * Tasks to perform in background
     */
    configTasks() {
        let purge = new Purge(this.auth.users)
        purge.watch()
    }
}

module.exports = Server
