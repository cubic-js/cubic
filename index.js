const local = require('./config/local.js')
const Server = require('./connections/server.js')
const _ = require('lodash')

class API {
  constructor (options) {
    this.config = {
      local: local,
      provided: options
    }
  }

  init() {
    const id = this.config.provided.id || (this.config.provided.master ?
               this.config.provided.master + '.api' : 'api')
    const config = _.get(blitz.config, id)
    this.server = new Server(config)
  }

  /**
   * Convenience methods that can be called from other nodes more easily
   */
  use(route, fn, verb) {
    return this.server.use(route, fn, verb)
  }
}

module.exports = API
