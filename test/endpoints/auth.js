const Endpoint = blitz.nodes.core.Endpoint

class Auth extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.scope = "read_contacts"
  }

  async main (req, res) {
    res.send('You\'re not supposed to be in here!')
  }
}

module.exports = Auth