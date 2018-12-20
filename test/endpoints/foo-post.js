const Endpoint = require('cubic-api/endpoint')

class Foo extends Endpoint {
  constructor (options) {
    super(options)
    this.schema.method = 'POST'
    this.schema.url = '/foo'
  }

  async main (req, res) {
    res.send(req.body)
  }
}

module.exports = Foo
