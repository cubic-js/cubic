const timeout = (fn, s) => {
  return new Promise(resolve => setTimeout(() => resolve(fn()), s))
}

/**
 * Queue for on_demand requests
 */
class Queue {
  constructor() {
    this.stack = []
    this.executing = null

    // Delay Timers
    // NOTE: The time required to wait will be pulled from 429 response
    // messages directly. This is only for fallbacks.
    if (options.ignore_limiter) {
      this.throttleDelay = 0
      this.fullDelay = 0
    }

    // With Token provided
    else if (options.user_key) {
      this.throttleDelay = 50
      this.fullDelay = 10000
    }
  }


  /**
   * Delay requests by given time
   */
  delay(fn, keyword, add = "push", delay = this.fullDelay) {
    this.add(fn, keyword, add, delay)
  }


  /**
   * Throttle requests by min difference
   */
  throttle(fn, keyword, add = "push", delay = this.throttleDelay) {
    this.add(fn, keyword, add, delay)
  }


  /**
   * If nothing is queued, start waterfall, otherwise expect waterfall to be
   * in progress
   */
  run() {
    if (!this.executing) {
      this.executing = true
      this.stack[0].fn()
    }
  }


  /**
   * Add function to stack and execute
   * Important: Function is assumed to be promisified
   */
  add(fn, keyword, add, delay) {
    return new Promise(resolve => {
      let fnMod = this.modFunction(fn, keyword, delay, resolve)

      // Push function to stack. Will run automatically once others are done.
      this.stack[add]({
        fn: fnMod,
        keyword: keyword
      })
      this.run()
    })
  }


  /**
   * Generate function with timeout and waterfall functionality
   */
  modFunction(fn, keyword, delay, resolve) {
    return async() => {
      resolve(await timeout(fn, delay))
      this.stack.shift()

      // Trigger next function if available
      if (this.stack[0]) {
        this.executing = true
        this.stack[0].fn()
      } else {
        this.executing = false
      }
    }
  }
}

export default Queue
