const Endpoint = cubic.nodes.core.Endpoint

class PubSub extends Endpoint {
  async main (req, res) {
    this.publish('pub')
    res.send('ok')
  }
}

module.exports = PubSub