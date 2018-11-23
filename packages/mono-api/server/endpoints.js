const fs = require('fs')
const path = require('path')
const mongodb = require('mongodb').MongoClient
const Stack = require('async-middleware-stack')
const Client = require('cubic-client')
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
    this.db = mongodb.connect(this.config.mongoUrl, { useNewUrlParser: true })
    this.api = new Client({
      api_url: config.apiUrl,
      auth_url: config.authUrl,
      user_key: config.userKey,
      user_secret: config.userSecret
    })
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
  async getResponse (req, res) {
    return new Promise(async resolve => {
      const endpoint = this.findByUrl(req.url, req.method)
      const passed = await this.stack.run(req, res, endpoint)

      // Execute target endpoint
      if (passed) {
        if (this.dev) this.deleteRequireCache(endpoint.file)
        const db = (await this.db).db(this.config.mongoDb)
        const Endpoint = require(endpoint.file)
        const component = new Endpoint(this.api, db, req.url)
        await component.main(req, res)
      }
    })
  }

  /**
   * Remove node's require cache while in dev mode so we needn't restart
   * to see endpoint changes. Disabled for default endpoint because of
   * cubic-ui's endpoint handling.
   */
  deleteRequireCache (file) {
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

  /**
   * Get specific endpoint through url detection
   */
  findByUrl (url, method) {
    url = url || '/' // empty url? => '/'
    let found = false
    let reqUrl = url.split('?')[0].split('/')

    for (let endpoint of this.endpoints) {
      // Skip endpoint if RESTful method doesn't match
      if (endpoint.method !== method) continue

      // Get route from provided URL or from base-url + file route
      let route = endpoint.url ? endpoint.url.split('/') : false ||
                  (this.config.baseUrl + endpoint.route).split('/')

      // Remove trailing empty el from `/` at end of route, but not if url is
      // '/' (index)
      if (!route[route.length - 1] && route.length > 2) route.pop()
      if (route.length === reqUrl.length) {
        for (let i = 0; i < reqUrl.length; i++) {
          // Current element doesn't match and isn't placeholder?
          if (route[i] !== reqUrl[i] && !route[i].includes(':')) {
            break
          }

          // Is last compared element in url?
          else if (i === reqUrl.length - 1) {
            found = endpoint
          }
        }
        if (found) break
      }
    }
    return found
  }
}

module.exports = EndpointController
