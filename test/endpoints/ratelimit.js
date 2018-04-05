const Endpoint = cubic.nodes.core.Endpoint

class Ratelimit extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.limit = {
      interval: 10000,
      maxInInterval: 5
    }
  }

  async main (req, res) {
    res.send('You\'re not supposed to be in here!')
  }
}

module.exports = Ratelimit