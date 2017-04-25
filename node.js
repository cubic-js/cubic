'use strict'


/**
 * Middleware Functions
 */
const Server = require('./connections/server.js')
const config = require('./config/local.js')


/**
 * Parent Class for API-Node
 */
class API {

    /**
     * Load config. Then Boot up server
     */
    constructor() {
        blitz.config.api = {}
        this.config()
        this.server = new Server()
    }


    /**
     * Automatically set local config
     */
    config() {
         for (var property in config) {
             blitz.config.api[property] = config[property]
         }
    }


    /**
     * Make combined middleware accessible from api Object
     */
    use(fn) {
        this.server.use(fn)
    }
}


module.exports = new API()
