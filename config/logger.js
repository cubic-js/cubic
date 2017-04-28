"use strict"

const chalk = require('chalk')

class Log {

    constructor() {

        // Hierarchically ordered log levels
        this.levels = ["silly", "verbose", "info", "error"]

        this.info = this.info
    }


    /**
     * Checks if log should proceed
     */
    includesLogLevel(level) {

        // Invalid Log Level
        if (!this.levels.includes(blitz.config.local.logLevel)) {
            return false
        }

        // Generate Array for every 'higher' log level to be included
        let i = this.levels.indexOf(blitz.config.local.logLevel)
        let enabled = this.levels.slice(i, this.levels.length)

        // Check if provided log level in enabled list
        if (enabled.includes(level)) {
            return true
        } else {
            return false
        }
    }


    /**
     * Default log level. Logs limited information about the node status.
     */
    info(str) {
        if(this.includesLogLevel("info")){
            console.log(chalk.grey("Info      | ") + str)
        }
    }


    /**
     * Error Log Level. Helpful for automated tests.
     */
    error(str) {
        if(this.includesLogLevel("error")) {
            console.error(chalk.red("Error     | ") + str)
        }
    }


    /**
     * Verbose log level. Includes Request Timestamps, Socket Connections, Config events, etc
     */
    verbose(str) {
        if(this.includesLogLevel("verbose")) {
            console.log(chalk.grey("System    | " + str))
        }
    }


    /**
     * Silly log level. Includes internal information on which routes are being bound, diagnostics and lifecycle details
     */
    silly(str) {
        if(this.includesLogLevel("silly")) {
            console.log(chalk.grey("System    | " + str))
        }
    }
}

module.exports = Log
