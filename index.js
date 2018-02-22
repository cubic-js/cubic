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
    const id = this.config.provided.group ? this.config.provided.group + '.api' : 'api'
    const config = _.get(blitz.config, id)
    config.prefix = config.prefix || `${config.group ? config.group + ' ' : ''}api`.padEnd(10)

    this.server = new Server(config)
    this.server.init()
  }

  /**
   * Convenience methods that can be called from other nodes more easily
   */
  use(route, fn, verb) {
    return this.server.use(route, fn, verb)
  }
}

module.exports = API
