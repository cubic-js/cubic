const Endpoint = blitz.nodes.core.Endpoint

class Get extends Endpoint {
  main (req, res) {
    res.send('ok')
  }
}

module.exports = Get