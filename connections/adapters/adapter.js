const Request = require('../../controllers/request.js')
const Stack = require('async-middleware-stack')
const mime = require('mime')

/**
 * Class describing connection adapter / Request Handler for different channel
 */
class Adapter {
  constructor (config) {
    // Create empty adapter middleware stack
    this.stack = new Stack(config)

    // Bind Request Controller to object
    this.request = new Request(config)
  }

  /**
   * Functions to run before allowing request
   */
  async prepass (req, res) {
    try {
      await this.stack.run(req, res)
      await this.pass(req, res)
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
    }
  }

  /**
   * Passes request to RequestController
   */
  async pass (req, res) {
    let response = await this.request.getResponse(req)
    let url = req.url.split('/')

    // Clarification: the first condition here checks if the last URL fragment
    // contains a dot BEFORE the RESTful query (starting with ?). This means
    // that the resource is a raw file, so we should send it as such.
    // Example: /some/resource/to/image.png?param=0.5
    //                                 ^ detected  ^ not detected
    if (url[url.length - 1].split('?')[0].split('.')[1] && response.statusCode <= 400) {
      let data = new Buffer(response.body || '', 'base64')
      res.header('content-type', mime.getType(req.url))
      res.end(data)
    } else {
      res.status(response.statusCode)[response.method](response.body)
    }
  }

  use(route, fn, verb) {
    this.stack.use(route, fn, verb)
  }
}

module.exports = Adapter
