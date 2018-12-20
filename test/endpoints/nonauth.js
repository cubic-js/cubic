const Endpoint = require('cubic-api/endpoint')

class Auth extends Endpoint {
  constructor (options) {
    super(options)
    this.schema.scope = 'read_contacts'
  }

  async main (req, res) {
    res.send('You\'re not supposed to be in here!')
  }
}

module.exports = Auth
