"use strict"

/**
 * Dependencies
 */
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const port = process.env.port
const auth = require('../models/auth.js')

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
        this.app = express()
        this.app.set('port', process.env.port)
        this.app.use(bodyParser.urlencoded({extended: false})).use(bodyParser.json())
        this.http = http.createServer(this.app)
        this.http.listen(process.env.port)

        // Express modifications
        this.configMiddleware()
        this.configRoutes()
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
        require('../config/routes.js')(this.app, auth)
    }
}

module.exports = new Server()
