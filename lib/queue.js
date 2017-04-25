'use strict'

/**
 * Delay Queue to avoid Rate limits
 * Note: Requests are handled through async delay states, not an actual queue list
 */
class Queue {

    /**
     * Set Queue timings
     */
    constructor(options) {

        // Delay Timers
        if (options.ignore_limiter) {
            this.delayDiff = 0
            this.delayMax = 0
        }

        // With Token provided
        else if (options.user_key) {
            this.delayDiff = 850
            this.delayMax = 10000
        }

        // No token
        else {
            this.delayDiff = 1100
            this.delayMax = 10000
        }

        // Queue Counter
        this.length = 1 // Objects in queue

        // Queue States
        this.nextCreatedAt = 0
        this.nextShiftAt = 0
    }


    /**
     * Makes sure limiter isn't triggered since last request
     */
    throttle() {
        return new Promise((resolve, reject) => {
            let now = new Date().getTime()

            // Set time until next interval
            if (!this.nextShiftAt){
                 var nextShift = 0
            }
            else{
                 var nextShift = this.nextShiftAt - now
            }

            // Check time between now and next available call
            let untilNextShift = now - this.nextCreatedAt - nextShift

            // Set new last request date
            this.nextCreatedAt = now

            // Calculate delay to wait for
            let delay = this.length * this.delayDiff + nextShift

            // Min difference is met
            if (untilNextShift > this.delayDiff) resolve()

            // Otherwise, wait for delay difference
            else {

                // Increase delay multiplier
                ++this.length

                // Resolve Promise & sub ongoing
                setTimeout(() => {

                    // Get current expected interval resolution
                    if (!this.nextShiftAt){
                        var currentShift = 0
                    }
                    else{
                        var currentShift = this.nextShiftAt - now
                    }

                    // Finished while waiting for next interval -> repeat
                    if (currentShift > nextShift) {
                        this.throttle().then(() => {
                            --this.length
                            resolve()
                        })
                    }

                    // Finished without waiting for interval
                    else {
                        --this.length // remove current request
                        resolve()
                    }
                }, delay)
            }
        })
    }


    /**
     * Manages Interval delays for rate limiting(coupled with this.throttle())
     */
    delay(delay) {
        return new Promise((resolve, reject) => {
            this.nextShiftAt = new Date().getTime() + delay

            setTimeout(() => {
                this.nextShiftAt = 0 // Reset
                resolve()
            }, delay)
        })
    }
}

module.exports = Queue
