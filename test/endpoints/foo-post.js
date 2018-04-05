const Endpoint = cubic.nodes.core.Endpoint

class Foo extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.method = "POST"
    this.schema.url = '/foo'
  }

  async main (req, res) {
    res.send(req.body)
  }
}

module.exports = Foo