"use strict"


/**
 * Express dependencies
 */
const express = require("express")
const http = require("http")


/**
 * Middleware helpers
 */
const layer = require("../layers.js")


/**
 * Request Controller
 */
const Request = require("../../controllers/request.js")


/**
 * Class describing the logic for handling each incoming request
 */
class HttpAdapter {

    constructor(port) {

        // Load Express
        this.app = express()

        // Start HTTP server.
        this.app.set("port", port)
        this.server = http.createServer(this.app)
        this.server.listen(port)

        // Create empty adapter middleware stack
        this.stack = []

        // Bind Request Controller to object
        this.request = new Request(this)
    }


    /**
     * Functions to run before allowing request
     */
    prepass(req, res) {
        // Iterate through middleware function stack
        layer.runStack(req, res, this.stack)
            .then(() => this.pass(req, res))
            .catch(() => {})
    }


    /**
     * Passes request to RequestController
     */
    pass(req, res) {
        this.request.getResponse(req)
        .then(response => res.status(response.statusCode).send(response.body))
    }


    /**
     * Accepts middleware to run before this.pass().
     */
    use(route, fn, verb) {
        let middleware = {
            method: verb ? verb : "ANY",
            route: typeof route === "string" ? route : "*", // check if includes. Maybe need reverse order for reading?
            fn: typeof fn === "function" ? fn : route
        }
        this.stack.unshift(middleware)
    }
}

module.exports = HttpAdapter
