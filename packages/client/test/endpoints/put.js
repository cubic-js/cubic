const Endpoint = cubic.nodes.core.Endpoint

class Put extends Endpoint {
  constructor (api, db, url) {
    super(api, db, url)
    this.schema.method = 'PUT'
  }

  async main (req, res) {
    res.send(req.body)
  }
}

module.exports = Put
