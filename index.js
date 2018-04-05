const local = require('./config/local.js')
const Client = require('./controllers/api.js')
const _ = require('lodash')

class Core {
  constructor (options) {
    this.config = {
      local: local,
      provided: options || {}
    }
  }

  init() {
    const id = this.config.provided.group ? this.config.provided.group + '.core' : 'core'
    const config = _.get(cubic.config, id)
    config.prefix = config.prefix || `${config.group ? config.group + ' ' : ''}core`.padEnd(10)

    this.Endpoint = require(config.endpointParent)
    this.client = new Client(config)
  }

  /**
   * Convenience methods that can be called from other nodes more easily
   */
  use(fn) {
    return this.client.endpointController.stack.use(fn)
  }
}

module.exports = Core
