const Endpoint = cubic.nodes.auth.api.Endpoint

class Index extends Endpoint {
  constructor (options) {
    super(options)
    this.schema.url = '/'
  }

  async main (req, res) {
    res.send('Use the /authenticate endpoint for initial authentication or /refresh to get new access tokens. New users can be created at /register.\n For full docs, please refer to the cubic-auth github repo (https://github.com/cubic-js/cubic).')
  }
}

module.exports = Index
