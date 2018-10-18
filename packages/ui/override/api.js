/**
 * Custom cubic-core API client to load views differently
 */
const Original = require('cubic-core/controllers/api.js')
const EndpointController = require('./endpoints.js')

class Api extends Original {
  constructor (config) {
    super(config)

    // Custom endpoint loader that automatically loads views
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
}

module.exports = Api
