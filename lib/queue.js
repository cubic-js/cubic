const timeout = function(fn, s) {
    return new Promise(resolve => setTimeout(() => resolve(fn()), s))
}

/**
 * Queue for on_demand requests
 */
class Queue {
    constructor() {
        this.stack = []
        this.executing = null
    }


    /**
     * Delay requests by given time
     */
    delay(fn, add = "push", delay) {
        return this.add(fn, add, delay)
    }


    /**
     * Add function to stack and execute
     * Important: Function is assumed to be promisified
     */
    add(fn, add, delay) {
        return new Promise(resolve => {
            const modFn = this.modFunction(fn, delay, resolve)

            // Insert AFTER currently active task, so the current one would only
            // remove itself after finishing
            if (this.stack[0] && add === "unshift") {
                this.stack.splice(1, 0, modFn)
            } else {
                this.stack[add](modFn)
            }
            this.run()
        })
    }


    /**
     * Generate function with timeout and waterfall functionality
     */
    modFunction(fn, delay, resolve) {
        return async () => {
            resolve(await timeout(fn, delay))
            this.stack.shift()

            // Trigger next function if available
            if (this.stack[0]) {
                this.executing = true
                this.stack[0]()
            } else {
                this.executing = false
            }
        }
    }


    /**
     * If nothing is queued, start waterfall, otherwise expect waterfall to be
     * in progress
     */
    run() {
        if (!this.executing) {
            this.executing = true
            this.stack[0]()
        }
    }
}

module.exports = Queue
