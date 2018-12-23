const Endpoint = require('cubic-api/endpoint')

class Get extends Endpoint {
  main (req, res) {
    res.send('ok')
  }
}

module.exports = Get
