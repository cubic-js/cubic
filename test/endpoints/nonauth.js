const Endpoint = require('cubic-api/endpoint')

class Auth extends Endpoint {
  constructor (options) {
    super(options)
    this.schema.scope = 'read_contacts'
    this.hasBeenHere = false
  }

  async main (req, res) {
    this.hasBeenHere = true
  }
}

module.exports = Auth
