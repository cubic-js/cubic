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
        // Merge existing blitz global with current if a new instance is
        // called inside a worker itself (necessary for hooking further
        // sub components)
        if (global.blitz) {
            blitz = _.merge(this, blitz)
            blitz.log.class = require("./config/logger.js")
        }

        // No instance was run before
        else {
            global.blitz = this
            blitz.config = {}
            blitz.nodes = {}
            blitz.log = new(require("./config/logger.js"))
            blitz.log.class = require("./config/logger.js")
        }

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
        let merged = _.merge(config.local, config.provided)
        blitz.config[id] = {}

        // Add each key to global blitz object
        for (var property in merged) {
            blitz.config[id][property] = merged[property]
        }
    }


    /**
     * Hook functions to be executed before specific node is clustered while making node config available to the Hook
     */
    hook(node, fn) {
        let id = typeof node === "string" ? node : node.name.toLowerCase()

        // Create global node obj if not existing
        if (!blitz.nodes[id]) {
            blitz.nodes[id] = {}
        }

        // Create hook stack to be executed before cluster()
        if (!blitz.nodes[id].hooks) {
            blitz.nodes[id].hooks = []
        }

        blitz.nodes[id].hooks.push(fn)
    }


    /**
     * Execute hooks for specific node
     */
    runHooks(id) {
        if (blitz.nodes[id].hooks) {
            blitz.nodes[id].hooks.forEach(hook => hook())
        }
    }


    /**
     * Let blitz handle framework modules
     */
    use(node) {
        let nid = node.config.provided ? node.config.provided.id : undefined
        let id = nid ? nid : node.constructor.name.toLowerCase()

        // Property already set? Merge them.
        if (blitz.nodes[id]) {
            blitz.nodes[id] = _.merge(blitz.nodes[id], node)
        }

        // Property not assigned before
        else {
            blitz.nodes[id] = {}
        }

        this.setConfig(id, node.config)
        this.runHooks(id)
        this.cluster(node, id)
    }


    /**
     * Create workers from node file
     */
    async cluster(node, id) {
        let file = node.filename
        let cores = 1 //blitz.config[id].cores

        // Fork Workers
        blitz.nodes[id].workers = []
        for (let i = 0; i < cores; i++) {

            // Add to node's worker list to be accessible globally
            blitz.nodes[id].workers.push(fork(file, {
                env: {
                    isWorker: true
                }
            }))
            let worker = blitz.nodes[id].workers[i]
            worker.ping = () => {return this.ping(worker)}

            // Send global blitz to worker
            blitz.id = id
            worker.send({
                type: "setGlobal",
                body: this.serialize(blitz)
            })

            // Make Worker methods accessible from global blitz
            this.exposeMethods(node, id)

            // Restart worker on exit
            blitz.nodes[id].workers[i].on("death", () => {
                blitz.nodes[id].workers.push(fork(file))
            })
        }
    }


    /**
     * Ping method to check for listeners on process. Returns time elapsed.
     */
     ping(worker) {
         return new Promise(resolve => {
             let timestart = new Date
             let resolved = false

             // Send ping
             worker.send({
                 type: "ping",
                 body: {}
             })

             // Listen to response
             worker.once("message", msg => {
                 if (msg.type === "pong") {
                     resolve(new Date - timestart)
                     resolved = true
                 }
             })

             // Retry if no response
             setTimeout(() => {
                 if (!resolved) {
                     this.ping(worker).then(() => {
                         resolve(new Date - timestart)
                         resolved = true
                     })
                 }
             }, 500)
         })
     }


    /**
     * Make Worker methods accessible from global blitz
     */
    exposeMethods(node, id) {
        for (let method of Object.getOwnPropertyNames(Object.getPrototypeOf(node))) {
            let _this = this
            blitz.nodes[id][method] = function() {
                return _this.setMethodInterface(id, method, arguments)
            }
        }
    }


    /**
     * Helper function which calls functions on worker
     */
    setMethodInterface(id, method, args) {
        return new Promise(resolve => {
            blitz.nodes[id].workers.forEach(async worker => {
                await worker.ping()

                // Call function with given args
                worker.send({
                    type: "call",
                    body: {
                        method: method,
                        args: this.serialize(args)
                    }
                })

                // Listen to response
                worker.on("message", msg => {
                    if (msg.type === "return" && msg.body.method === method) {
                        resolve(msg.body.value)
                    }
                })
            })
        })
    }

    /**
     * Serialize global blitz object so it can be sent via stdout to workers
     */
    serialize(obj) {
        return CircularJSON.stringify(obj, (key, value) => {
            return (typeof value === 'function') ? value.toString() : value
        })
    }
}


/**
 * Pass options to constructor on require
 */
module.exports = (options) => {
    new Blitz(options)
}
