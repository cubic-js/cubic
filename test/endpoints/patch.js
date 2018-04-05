const Endpoint = cubic.nodes.core.Endpoint

class Patch extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.method = 'PATCH'
  }

  async main (req, res) {
    res.send(req.body)
  }
}

module.exports = Patch