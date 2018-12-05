const Endpoint = cubic.nodes.core.Endpoint

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
