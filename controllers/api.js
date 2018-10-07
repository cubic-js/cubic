const Client = require('cubic-client')
const EndpointController = require('./endpoints.js')

/**
 * Connects to Cubic API Node
 */
class Api {
  constructor (config) {
    this.config = config
    const options = {

      // Connection Settings
      api_url: config.apiUrl,
      auth_url: config.authUrl,

      // Authentication Settings
      user_key: config.userKey,
      user_secret: config.userSecret
    }

    // Connect to api-node
    this.api = new Client(options)

    // Load Endpoint Controller
    this.endpointController = new EndpointController(config)
    this.sendEndpointSchema()
    this.init()
  }

  /**
   * Send endpoint schema to API node, so it'll know which requests we can serve
   */
  async sendEndpointSchema () {
    await this.api.connecting
    this.api.connection.client.send(JSON.stringify({
      action: 'SCHEMA',
      endpoints: this.endpointController.endpoints,
      maxPending: this.config.maxPending
    }))
  }

  /**
   * Initialization method called by EndpointHandler after passing methods
   */
  async init () {
    await this.api.connecting
    this.listen()
    this.api.connection.client.on('open', () => this.log('connected to target API'))
    this.api.connection.client.on('close', () => this.log('disconnected from target API'))
  }

  /**
   * Listen to incoming requests to be processed
   */
  listen () {
    this.api.connection.client.on('message', async data => {
      data = JSON.parse(data)
      const { action } = data

      if (action === 'REQ') {
        const { req, endpoint, id } = data
        const res = await this.endpointController.getResponse(req, this.api, endpoint)
        this.api.connection.client.send(JSON.stringify({
          action: 'RES',
          res,
          id
        }))
      }
    })
  }

  log (msg) {
    cubic.log.verbose(`${this.config.prefix} | ${msg}`)
  }
}

module.exports = Api
