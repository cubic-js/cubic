const Endpoints = require('../endpoints.js')
const Stack = require('async-middleware-stack')

class Adapter {
  constructor (config, cache) {
    this.config = config
    this.stack = new Stack(config)
    this.endpoints = new Endpoints()
  }

  async runMiddleware (req, res) {
    const done = await this.stack.run(req, res)
    if (done) {
      await this.endpoints.getResponse(req, res)
    }
  }

  use (route, fn, verb) {
    this.stack.use(route, fn, verb)
  }
}

module.exports = Adapter
