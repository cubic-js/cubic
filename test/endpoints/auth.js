const Endpoint = cubic.nodes.core.Endpoint

class Delete extends Endpoint {
  constructor (api, db, url) {
    super(api, db, url)
    this.schema.scope = 'write_test'
  }

  async main (req, res) {
    res.send('ok')
  }
}

module.exports = Delete
