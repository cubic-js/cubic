const Endpoint = require('cubic-api/endpoint')

class Foo extends Endpoint {
  main (req, res) {
    res.send('bar')
  }
}

module.exports = Foo
