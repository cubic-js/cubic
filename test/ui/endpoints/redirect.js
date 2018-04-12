const Endpoint = cubic.nodes.ui.core.Endpoint

class Redirect extends Endpoint {
  main(req, res) {
    res.redirect('/')
  }
}

module.exports = Redirect