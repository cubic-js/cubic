'use strict'


/**
 * Middleware Functions
 */
const Server = require('./connections/server.js')
const local = require('./config/local.js')
const _ = require('lodash')


/**
 * Parent Class for API-Node
 */
class API {

    /**
     * Load config. Then Boot up server
     */
    constructor(options) {
        blitz.config.api = {}
        
        // Add config to global blitz.config
        let config = _.merge(local, options)
        this.setConfig(config)
        
        // Load up API Server
        this.server = new Server()
    }


    /**
     * Automatically attach config to global blitz object
     */
    setConfig(config) {
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
