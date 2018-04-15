"use strict"

/**
 * Dependencies
 */
const local = require("./config/local.js")
const worker = require("blitz-js-util")
const Server = require("./connections/server.js")

/**
 * Parent Class for API-Node
 */
class api {

    /**
     * Set config for blitz.js to merge
     * @constructor
     */
    constructor(options) {

        // Process forked
        if (process.send) {
            worker.connect(this).then(() => this.init())
        }

        // Process not forked
        else {

            // Config which is called by blitz.js on blitz.use()
            this.config = {
                local: local,
                provided: options
            }

            // Path for forking
            this.filename = __filename
        }
    }

    init() {
        this.server = new Server()
    }

    use(fn){
        this.server.use(fn)
    }
}

module.exports = process.send ? new api() : api
