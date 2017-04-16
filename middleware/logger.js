'use strict'

const chalk = require('chalk')

/**
 * Logger Middleware
 */
class Logger {
    log(req, res, next) {

        // Prepare output
        this.prefix = chalk.grey("Nexus-OAuth | ")
        this.setBody(req)
        this.logErr(next)
        this.logRes(res)
        this.addTimer(res)

        // Actual Console Output
        console.log(this.prefix + chalk.grey(":: " + new Date()))
        console.log(`${this.prefix}< ${req.ip}: ${req.method} ${req.url} ${this.body}`)
        next()
    }


    /**
     * Log any errors passed to next()
     */
    logErr(next) {
        let _next = next
        next = (err) => {
            _next(err)
            if (err) {
                console.log(this.prefix + chalk.red("> ") + err)
            }
        }
    }


    /**
     * Log Output of res.send
     */
    logRes(res) {
        let io = "> "
        let _send = res.send
        let prefix = this.prefix

        res.send = function(body) {
            _send.call(this, body)

            // Output is error?
            if (res.statusCode.toString()[0] < 4) {
                io = chalk.green(io)
                console.log(prefix + io + res.statusCode + ": [token]")
            } else {
                io = chalk.red(io)
                console.log(prefix + io + res.statusCode + ": " + body)
            }
        }
    }


    /**
     * Add Timer to original res.send
     */
    addTimer(res) {
        let timestart = process.hrtime()
        let _send = res.send
        let prefix = this.prefix

        res.send = function(body) {
            _send.call(this, body)
            console.log(prefix + chalk.grey("> " + (process.hrtime()[1] - timestart[1]) / 1000000 + "ms"))
            console.log(" ")
        }
    }


    /**
     * Get relevant information from req.body
     */
    setBody(req) {

        // Initial auth
        if(req.body.user_key) {
            this.body = req.body.user_key
        }

        // Refresh token auth
        else if (req.body.refresh_token) {
            this.body = "[refresh token+]"
        }

        // Unhandled body type
        else {
            this.body = JSON.stringify(req.body)
        }
    }
}

module.exports = new Logger()
