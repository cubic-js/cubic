const Endpoint = cubic.nodes.core.Endpoint

class Delete extends Endpoint {
  constructor (options) {
    super(options)
    this.schema.scope = 'write_test'
  }

  async main (req, res) {
    res.send('ok')
  }
}

module.exports = Delete
