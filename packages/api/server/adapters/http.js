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
    const transformer = new Transformer()
    this.app = polka()
    this.server = createServer(this.app.handler).listen(config.port)

    // The transform middleware has to run before everything else
    this.app.use(transformer.convertRes)

    // Run http middleware directly instead of async stack, because they are not allowed to run on ws requests
    this.app.use(bodyParser.urlencoded({ extended: true })).use(bodyParser.json())
    this.app.use(middleware.decode)
    this.app.use(middleware.cookie.bind(middleware))
    this.app.use(middleware.authorize.bind(middleware))
    this.app.use(this.runMiddleware.bind(this))
  }

  async runMiddleware (req, res) {
    const transformer = new Transformer()
    req = transformer.convertReq(req)
    const done = await this.stack.run(req, res)

    if (done) {
      await this.endpoints.getResponse(req, res)
    }
  }
}

module.exports = HttpAdapter
