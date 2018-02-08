const Endpoint = require(blitz.config[blitz.id].endpointParent)

class Index extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.url = '/'
  }

  async main(req, res) {
    res.send('Use the /authenticate endpoint for user/secret auth or /refresh for further refresh-token based authentication. New users can be created at /register .')
  }
}

module.exports = Index
