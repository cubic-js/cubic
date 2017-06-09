"use strict"

/**
 * Lodash for array deep clone
 */
const _ = require("lodash")

/**
 * Middleware Handler for connection adapters
 */
class Layer {

    /**
     * Runs through middleware functions before adapter.pass
     */
    next(err) {
        this.next = this.next.bind(this) // preserve `this` on callback

        // Error occured? Send back to client.
        if (err) {
            this.res.status(500).send(err)
            return this.reject()
        }

        // Otherwise, continue waterfall
        else if (this.stack.length >= 1) {

            // Take out next function to process
            this.stack.pop()
            let mw = this.stack.slice(-1)[0]

            // mw is falsy -> all middleware has been called already
            if (!mw) {
                return this.resolve()
            }

            // Call next middleware if route matches
            if (this.routeMatches(mw)) {
                try {
                    mw.fn(this.req, this.res, this.next)
                } catch (err) {
                    this.next(err)
                }
            } else {
                this.next()
            }
        }
    }


    /**
     * Check if route matches and assign optional placeholders
     */
    routeMatches(mw) {

        // Normalize url/route format
        mw.route = mw.route[mw.route.length - 1] === "/" ? mw.route.slice(0, -1) : mw.route
        this.req.url = this.req.url[this.req.url.length - 1] === "/" ? this.req.url.slice(0, -1) : this.req.url

        // Add params to req object if present
        let route = mw.route.split("/")
        let url =  this.req.url.split("/")
        this.req.params = {}

        for (let i = 0; i < route.length; i++) {

            // params already assigned? means route has been matched
            if (Object.keys(this.req.params).length > 0) {
                break
            }

            // Add placeholder value to req object
            if (route[i][0] === ':') {
                this.req.params[route[i].replace(":", "")] = url[i]
                url[i] = route[i] // Wildcard for route check below
                continue
            }

            // Not matching, clear any params and stop
            else if (route[i] !== url[i]) {
                this.req.params = {}
                break
            }
        }

        // https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript
        if (new RegExp("^" + mw.route.split("*").join(".*") + "$").test(url.join("/")) && (this.req.method === mw.method || mw.method === "ANY")) {
            return true
        }

        // Not matching
        else {
            return false
        }
    }


    /**
     * Executes middleware functions
     */
    runStack(req, res, stack) {
        return new Promise((resolve, reject) => {

            // Pass  request & function stack to middleware
            this.new(req, res, stack)

            // Make resolve/reject accessible to next()
            this.resolve = resolve
            this.reject = reject

            // Trigger stack waterfall
            this.next()
        })
    }


    /**
     * Modify Layer for new requests
     */
    new(req, res, stack) {
        this.req = req
        this.res = res
        this.stack = _.cloneDeep(stack) // ensure stack doesn't get modified for next request

        // Stack needs buffer to be popped on first next()
        this.stack.push(null)
    }
}

module.exports = Layer
