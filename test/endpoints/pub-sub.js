const Endpoint = require('cubic-api/endpoint')

class PubSub extends Endpoint {
  async main (req, res) {
    this.publish('pub')
    res.send('ok')
  }
}

module.exports = PubSub
