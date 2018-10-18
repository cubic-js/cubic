/**
 * Custom cubic-core entry point to load views differently
 */
const Original = require('cubic-core')
const Api = require('./api.js')
const Client = require('cubic-client')
const _ = require('lodash')

class Core extends Original {
  init () {
    const id = this.config.provided.group ? this.config.provided.group + '.core' : 'core'
    const config = _.get(cubic.config, id)
    config.prefix = config.prefix || `${config.group ? config.group + ' ' : ''}core`.padEnd(10)
    this.Endpoint = require('./endpoint.js')
    this.client = new Api(config)
    this.client.api = new Client(this.client.clientOptions)
    this.client.listen()
  }
}

module.exports = Core
