const Endpoint = require(cubic.config.auth.core.endpointParent)

class Index extends Endpoint {
  constructor (api, db, url) {
    super(api, db, url)
    this.schema.url = '/'
  }

  async main (req, res) {
    res.send('<p style="font-family: sans-serif">Use the <b>/authenticate</b> endpoint for initial authentication or <b>/refresh</b> to get new access tokens. New users can be created at <b>/register</b>.<br><br> For full docs, please refer to the cubic-auth <a href="https://github.com/nexus-devs/cubic-auth">github repo</a>.</p>')
  }
}

module.exports = Index
