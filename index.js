"use strict"

/**
 * Dependencies
 */
const local = require('./config/local.js')
const worker = require("../blitz.js-util/index.js")
const Client = require("./controllers/api.js")


/**
 * Describes parent class which controls all objects handling input/output
 */
class Core {

    /**
     * Set config for blitz.js to merge
     * @constructor
     */
    constructor(options) {

        // Process forked
        if (process.env.isWorker) {
            this.setup = worker.setGlobal()
            this.setup.then(() => this.init())
            worker.expose(this)
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
        this.client = new Client()
    }
}

module.exports = process.env.isWorker ? new Core() : Core
