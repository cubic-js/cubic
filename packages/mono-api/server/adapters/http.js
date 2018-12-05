const Adapter = require('./adapter.js')
const polka = require('polka')
const bodyParser = require('body-parser')
const Middleware = require('../../middleware/native/http.js')
const Transformer = require('../transformers/http.js')
const { createServer } = require('http')

class HttpAdapter extends Adapter {
  constructor (config) {
    super(config)
    const middleware = new Middleware(config)
    this.app = polka()
    this.server = createServer(this.app.handler).listen(config.port)
    this.app.use(bodyParser.urlencoded({ extended: true })).use(bodyParser.json())
    this.app.use(middleware.decode)
    this.app.use(middleware.cookie.bind(middleware))
    this.app.use(middleware.authorize.bind(middleware))
    this.app.use(this.runMiddleware.bind(this))
  }

  async runMiddleware (req, res) {
    const transformer = new Transformer()
    req = transformer.convertReq(req)
    transformer.convertRes(res)
    const done = await this.stack.run(req, res)

    if (done) {
      await this.endpoints.getResponse(req, res)
    }
  }
}

module.exports = HttpAdapter
