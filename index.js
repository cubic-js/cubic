"use strict"

/**
 * Dependencies
 */
const local = require('./config/local.js')
const worker = require("blitz-js-util")
const EndpointHandler = require("./EndpointHandler.js")


/**
 * Describes parent class which controls all objects handling input/output
 */
class core {

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
        this.endpointHandler = new EndpointHandler()
    }
}

module.exports = process.send ? new core() : core
