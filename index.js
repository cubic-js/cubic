'use strict'

/**
 * Dependencies
 */
const local = require('./config/local.js')
const ipc = require('blitz-js-ipc')
const Client = require('./controllers/api.js')

/**
 * Describes parent class which controls all objects handling input/output
 */
class Core {
  /**
   * Set config for blitz.js to merge
   * @constructor
   */
  constructor (options) {
    // Process forked
    if (process.env.isWorker) {
      this.setup = ipc.setGlobal()
      this.setup.then(() => this.init())
      ipc.expose(this)
    }

    // Process not forked
    else {
      // Config which is called by blitz.js on blitz.use()
      this.config = {
        local: local,
        provided: options
      }

      // Path for forking
      this.filename = __filename
    }
  }

  init () {
    this.client = new Client()
  }

  /**
   * Run any function from a remote process with `this` context
   */
  run (fn) {
    return fn.apply(this)
  }
}

module.exports = process.env.isWorker ? new Core() : Core
