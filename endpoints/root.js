const Endpoint = require(blitz.config[blitz.id].endpointParent)

/**
 * Contains multi-purpose functions for child-methods and provides default values
 */
class Auth extends Endpoint {
  constructor (api, db, url) {
    super(api, db, url)
    this.schema.scope = 'root-read'
    this.schema.description = 'Testing method for checking root authorization'
  }

  async main () {
    return 'authorized'
  }
}

module.exports = Auth
