const local = require('./config/local.js')
const Server = require('./connections/server.js')

class API {
  constructor (options) {
    this.config = {
      local: local,
      provided: options
    }
  }

  init() {
    const id = this.config.provided.id || this.config.local.id
    this.server = new Server(id)
  }
}

module.exports = API
