const Endpoint = require('cubic-api/endpoint')

class Ratelimit extends Endpoint {
  constructor (options) {
    super(options)
    this.schema.query = [
      {
        name: 'required',
        required: true
      }
    ]
  }

  async main (req, res) {
    res.send('You\'re not supposed to be in here!')
  }
}

module.exports = Ratelimit
