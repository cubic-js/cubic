const Endpoint = cubic.nodes.core.Endpoint

class Post extends Endpoint {
  constructor (api, db, url) {
    super(api, db, url)
    this.schema.method = 'POST'
  }

  async main (req, res) {
    res.send(req.body)
  }
}

module.exports = Post
