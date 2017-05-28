"use strict"

/**
 * Lodash for array deep clone
 */
const _ = require("lodash")


/**
 * Variables outside scope for .next() to be callable
 */
let self = {}


/**
 * Middleware Handler for connection adapters
 */
class Layer {

    constructor() {
        self = this
    }

    /**
     * Runs through middleware functions before adapter.pass
     */
    next(err) {

        // Error occured? Send back to client.
        if (err) {
            console.log(err)
            self.res.status(500).send(err)
            return self.reject()
        }

        // Otherwise, continue waterfall
        else if (self.stack.length >= 1) {

            // Take out next function to process
            self.stack.pop()
            let mw = self.stack.slice(-1)[0]

            // mw is falsy -> all middleware has been called already
            if (!mw) {
                return self.resolve()
            }

            // Call next middleware if route matches
            if (self.routeMatches(mw)) {
                try {
                    mw.fn(self.req, self.res, self.next)
                } catch (err) {
                    self.next(err)
                }
            } else {
                self.next()
            }
        }
    }


    /**
     * Check if route matches and assign optional placeholders
     */
    routeMatches(mw) {

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
        this.next = this.next

        // Stack needs buffer to be popped on first next()
        this.stack.push(null)
    }
}

module.exports = new Layer()
