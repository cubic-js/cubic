"use strict"

/**
 * Dependencies
 */
const local = require("./config/local.js")

/**
 * Parent Class for API-Node
 */
class auth {

    /**
     * Set config for blitz.js to merge
     * @constructor
     */
    constructor(options) {

        // Config which is called by blitz.js on blitz.use()
        this.config = {
            local: local,
            provided: options
        }

        // Path to module to be forked
        this.appPath = __dirname + "/connections/server.js"
    }
}


module.exports = auth
