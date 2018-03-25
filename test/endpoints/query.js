const Endpoint = blitz.nodes.core.Endpoint

class Ratelimit extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.query = [
      {
        name: 'required',
        required: true
      }
    ]
  }

  async main (req, res) {
    res.send('You\'re not supposed to be in here!')
  }
}

module.exports = Ratelimit