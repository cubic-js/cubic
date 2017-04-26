'use strict'


/**
 * Dependencies
 */
const Server = require('./connections/server.js')
const local = require('./config/local.js')
const _ = require('lodash')


/**
 * Cluster Dependencies
 */
const cluster = require("cluster")


/**
 * Parent Class for API-Node
 */
class API {

    /**
     * Load config. Then Boot up server
     */
    constructor(options) {

        // Add config to global blitz.config
        this.setConfig(options)

        // Launch Cluster
        this.setupCluster()
    }


    /**
     * Set up Cluster
     */
    setupCluster() {
        
        // Fork Workers
        if(cluster.isMaster) {
            for (let i = 0; i < blitz.config.api.cores; i++) cluster.fork()
        }

        // Worker Setup
        else {
            blitz.log.verbose(":: " + new Date())
            blitz.log.info("API-Node-Worker started [PID: " + process.pid + "]")

            // Load up API Server
            this.server = new Server()
        }
    }


    /**
     * Automatically attach config to global blitz object
     */
    setConfig(options) {
        blitz.config.api = {}
        let config = _.merge(local, options)

        // Add each key to global blitz object
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


module.exports = API
