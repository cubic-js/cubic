const Endpoint = cubic.nodes.core.Endpoint

class Placeholder extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.url = '/foo/:test/stuff'
  }

  async main (req, res) {
    res.send(req.params.test)
  }
}

module.exports = Placeholder