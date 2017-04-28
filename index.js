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

        // Temporarily restrict max cores to 1 due to clusterfuck
        this.config.provided.cores = 1

        // Path to module to be forked
        this.appPath = __dirname + "/connections/client.js"
    }
}

module.exports = core
