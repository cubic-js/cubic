const Endpoint = cubic.nodes.core.Endpoint

class Delete extends Endpoint {
  constructor (options) {
    super(options)
    this.schema.method = 'DELETE'
  }

  async main (req, res) {
    res.send(req.body)
  }
}

module.exports = Delete
