"use strict"

/**
 * Dependencies
 */
const Cluster = require('multi-cluster')

class Blitz {

    /**
     * Set global blitz config system
     */
    constructor() {
        global.blitz = {
            config: {}
        }
    }

    /**
     * Set modular nodes to be handled by blitz
     */
    set(property, node) {
        this[property] = node
        this.api = new Cluster(node, node.workers)
    }
}

module.exports = new Blitz()
