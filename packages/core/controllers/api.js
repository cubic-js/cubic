const EndpointController = require('./endpoints.js')

/**
 * Connects to Cubic API Node
 */
class Api {
  constructor (config) {
    this.config = config

    // Load Endpoint Controller
    this.endpointController = new EndpointController(config)

    this.clientOptions = {

      // Connection Settings
      api_url: config.apiUrl,
      auth_url: config.authUrl,

      // Authentication Settings
      user_key: config.userKey,
      user_secret: config.userSecret,

      // Endpoint Schema for API node
      schema: {
        endpoints: this.endpointController.endpoints,
        maxPending: config.maxPending
      }
    }
  }

  /**
   * Listen to incoming requests to be processed
   */
  async listen () {
    await this.api.connecting()
    this.api.connection.client.on('close', () => setTimeout(() => this.listen(), 10))
    this.api.connection.client.on('error', () => setTimeout(() => this.listen(), 10))
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
