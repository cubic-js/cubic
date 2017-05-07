"use strict"

/**
 * Dependencies
 */
const local = require('./config/local.js')

/**
 * Describes parent class which controls all objects handling input/output
 */
class core {

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
        this.appPath = __dirname + "/EndpointHandler.js"
    }
}

module.exports = core
