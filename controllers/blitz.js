"use strict"

/**
 * Dependencies
 */
const CircularJSON = require("circular-json")
const chalk = require("chalk")


/**
 * Class to handle global blitz.js object. I hate myself for creating this.
 */
class Blitz {

    /**
     * Create global blitz object
     */
    constructor(obj) {

        // Set global blitz from parent process
        global.blitz = this.unserialize(obj)

        // Create new logger from class
        blitz.log = eval("new " + blitz.log.class + "()")
    }

    /**
     * Deserialize given obj.
     */
    unserialize(obj) {
        return CircularJSON.parse(obj, function(key, value) {
            if (typeof value != 'string') return value
            return (value.substring(0, 8) == 'function' || value.includes(") => {")) ? eval('(' + value + ')') : value
        })
    }
}

module.exports = Blitz
