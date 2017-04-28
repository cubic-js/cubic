"use strict"

/**
 * Dependencies
 */
const local = require('./config/local.js')
const CircularJSON = require("circular-json")
const _ = require('lodash')
const fork = require("child_process").fork


/**
 * Blitz.js module builder
 */
class Blitz {

    /**
     * Set global blitz config system
     */
    constructor(options) {
        global.blitz = this
        blitz.config = {}
        blitz.nodes = {}
        blitz.log = new(require("./config/logger.js"))
        blitz.log.class = require("./config/logger.js")

        let config = {
            local: local,
            provided: options
        }

        this.setConfig("local", config)
    }


    /**
     * Attach module config to global blitz object
     */
    setConfig(id, config) {
        blitz.config[id] = {}
        let merged = _.merge(config.local, config.provided)

        // Add each key to global blitz object
        for (var property in merged) {
            blitz.config[id][property] = merged[property]
        }
    }


    /**
     * Let blitz handle framework modules
     */
    use(node) {
        let nodeid = node.constructor.name

        // Property already set? Merge them.
        if (blitz.nodes[nodeid]) {
            blitz.nodes[nodeid] = _.merge(blitz.nodes[nodeid], node)
        }

        // Property not assigned before
        else {
            blitz.nodes[nodeid] = node
        }

        this.setConfig(nodeid, node.config)
        this.cluster(nodeid, node.appPath)
    }


    /**
     * Cluster given blitz module
     */
    cluster(id, appPath) {
        let cores = 1 //blitz.config[id].cores

        // Initialize array to push workers into
        blitz.nodes[id].workers = []

        // Fork Workers
        for (let i = 0; i < cores; i++) {

            // Add to node's worker list to be accessible globally
            blitz.nodes[id].workers.push(fork(appPath))

            // Send global blitz to worker
            let serialized = this.serialize(blitz)
            blitz.nodes[id].workers[i].send({global: serialized})
        }

        blitz.log.info(id + "-node has been launched on " + cores + " core" + (cores <= 1 ? "" : "s"))
    }


    /**
     * Serialize global blitz object
     */
     serialize(obj) {
         return CircularJSON.stringify(obj,function(key, value){
            return (typeof value === 'function' ) ? value.toString() : value
        })
     }
}


/**
 * Pass options to constructor on require
 */
module.exports = (options) => {
    new Blitz(options)
}
