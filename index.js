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
    const config = _.get(blitz.config, id)
    config.prefix = config.prefix || `${config.group ? config.group + ' ' : ''}core`.padEnd(10)

    this.Endpoint = require(config.endpointParent)
    this.client = new Client(config)
  }
}

module.exports = Core
