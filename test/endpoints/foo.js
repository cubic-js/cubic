const Endpoint = blitz.nodes.core.Endpoint

class Foo extends Endpoint {
  main (req, res) {
    res.send('bar')
  }
}

module.exports = Foo