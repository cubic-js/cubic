const Endpoint = blitz.nodes.core.Endpoint

class Post extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.method = 'POST'
  }

  async main (req, res) {
    res.send('ok')
  }
}

module.exports = Post