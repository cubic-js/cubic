const Endpoint = cubic.nodes.core.Endpoint

class Retry extends Endpoint {
  main (req, res) {
    retryCounter++
    if (retryCounter === 3) {
      res.send('ok')
    } else {
      res.status(503).send('nop')
    }
  }
}

module.exports = Retry
