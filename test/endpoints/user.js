const Endpoint = cubic.nodes.core.Endpoint
const username = require('username')

class User extends Endpoint {
  async main (req, res) {
    const user = await username()
    res.send(user)
  }
}

module.exports = User
