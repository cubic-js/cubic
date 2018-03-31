const Endpoint = blitz.nodes.core.Endpoint

class Delete extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.method = 'DELETE'
  }

  async main (req, res) {
    res.send(req.body)
  }
}

module.exports = Delete