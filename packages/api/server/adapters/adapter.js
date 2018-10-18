const Request = require('../request.js')
const Stack = require('async-middleware-stack')
const mime = require('mime')

class Adapter {
  constructor (config) {
    this.config = config
    this.stack = new Stack(config)
    this.request = new Request(config)
  }

  async runMiddleware (req, res) {
    const done = await this.stack.run(req, res)
    if (done) {
      await this.getResponse(req, res)
    }
  }

  async getResponse (req, res) {
    const response = await this.request.getResponse(req)
    const headers = {
      ...{ 'content-type': mime.getType(req.url) },
      ...response.headers
    }
    // Turn buffers into actual buffers
    if (response.body.type === 'Buffer') {
      response.body = Buffer.from(response.body.data)
    }
    res.status(response.statusCode)[response.method](response.body, headers)
  }

  use (route, fn, verb) {
    this.stack.use(route, fn, verb)
  }
}

module.exports = Adapter
