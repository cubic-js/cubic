const fs = require('fs')
const path = require('path')
const mongodb = require('mongodb').MongoClient
const Stack = require('async-middleware-stack')
const Response = require('../lib/response.js')
const Limiter = require('../middleware/limiter.js')
const url = require('../middleware/url.js')
const query = require('../middleware/query.js')
const auth = require('../middleware/auth.js')

/**
 * Interface for handling endpoints
 */
class EndpointController {
  constructor (config) {
    this.config = config
    this.dev = cubic.config.local.environment === 'development'
    this.db = mongodb.connect(this.config.mongoUrl)
    this.stack = new Stack(config)
    this.limiter = new Limiter(config)
    this.generateEndpointSchema()
    this.applyMiddleware()
  }

  /**
   * Add middleware functions to be executed before request is passed to
   * endpoint.
   */
  applyMiddleware () {
    this.stack.use(this.limiter.check.bind(this.limiter))
    this.stack.use(url.parse.bind(url))
    this.stack.use(query.verify)
    this.stack.use(auth.verify)
  }

  /**
   * Calls endpoint with given param Array
   */
  async getResponse (req, api, file) {
    return new Promise(async resolve => {
      const res = new Response(resolve, api)
      const endpoint = this.endpoints.find(e => e.file === file)
      const passed = await this.stack.run(req, res, endpoint)

      // Execute target endpoint
      if (passed) {
        // Remove node's require cache while in dev mode so we needn't restart
        // to see endpoint changes. Disabled for default endpoint because of
        // cubic-ui's endpoint handling.
        if (this.dev) {
          const resolved = require.resolve(file)
          this.endpoints = []

          // Delete from module parent
          if (require.cache[resolved] && require.cache[resolved].parent) {
            let i = require.cache[resolved].parent.children.length

            while (i--) {
              if (require.cache[resolved].parent.children[i].id === resolved) {
                require.cache[resolved].parent.children.splice(i, 1)
              }
            }
          }

          // Delete module from cache
          delete require.cache[require.resolve(file)]
          this.generateEndpointSchema()
        }
        const db = (await this.db).db(this.config.mongoDb)
        const Component = require(file)
        const component = new Component(api, db, req.url)
        await component.main(req, res)
      }
    })
  }

  generateEndpointSchema () {
    this.endpoints = []
    this.getEndpointTree(this.config.endpointPath)

    // Reorder items which must not override previous url's with similar route
    // e.g. /something/:id must not be routed before /something/else
    let pushToStart = []
    let pushToEnd = []
    this.endpoints.forEach(endpoint => {
      if (endpoint.route.includes(':')) pushToEnd.push(endpoint)
      else pushToStart.push(endpoint)
    })
    this.endpoints = pushToStart.concat(pushToEnd)
  }

  getEndpointTree (filepath) {
    let stats = fs.lstatSync(filepath)
    let regexclude = this.config.endpointPathExclude

    // Skip if excluded from subpaths
    if (filepath.match(regexclude)) {
      return
    }

    // Folder
    if (stats.isDirectory()) {
      fs.readdirSync(filepath).map(child => {
        return this.getEndpointTree(filepath + '/' + child)
      })
    }

    // File -> Set endpoint config
    else {
      let Endpoint = require(filepath.replace('//', '/'))
      let endpoint = new Endpoint().schema

      // Routes
      endpoint.name = path.basename(filepath).replace('.js', '')
      endpoint.file = filepath
      let route = endpoint.file.replace(this.config.endpointPath, '').replace('.js', '')
      endpoint.route = endpoint.url ? endpoint.url : this.config.baseUrl + route
      this.endpoints.push(endpoint)
    }
  }
}

module.exports = EndpointController
