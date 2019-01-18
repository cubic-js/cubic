const fs = require('fs')
const promisify = require('util').promisify
const path = require('path')
const Url = require('url')
const mongodb = require('mongodb').MongoClient
const Stack = require('async-middleware-stack')
const Limiter = require('../middleware/endpoints/limiter.js')
const url = require('../middleware/endpoints/url.js')
const query = require('../middleware/endpoints/query.js')
const auth = require('../middleware/endpoints/auth.js')

/**
 * Handles files in /api/ folder so they're automatically routed as API endpoints.
 */
class EndpointController {
  constructor (config) {
    this.config = config
    this.dev = cubic.config.local.environment === 'development'
    this.db = mongodb.connect(this.config.mongoUrl, {
      useNewUrlParser: true,
      auto_reconnect: true,
      keepAlive: 1,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000
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

      // Check if we can find the file locally
      if (!endpoint) {
        return this.sendNotFound(req, res)
      }

      // Execute target endpoint
      const passed = await this.stack.run(req, res, endpoint)

      if (passed) {
        if (this.dev) this.deleteRequireCache(endpoint.file)
        const db = (await this.db).db(this.config.mongoDb)
        const options = { url: req.url, cache: this.cache, ws: this.ws, db }
        const Endpoint = require(endpoint.file)
        const component = new Endpoint(options)
        await component.main(req, res)
      }
    })
  }

  /**
   * Send local file if endpoint couldn't be matched, otherwise send a 404.
   */
  async sendNotFound (req, res) {
    function notFound () {
      res.status(404).send({
        error: 'Not found.',
        reason: `Couldn't find ${req.url}.`
      })
    }
    if (path.extname(path.basename(Url.parse(req.url).pathname || ''))) {
      try {
        const readFile = promisify(fs.readFile)
        const filepath = path.join(this.config.publicPath, req.url)
        return res.send(Buffer.from(await readFile(filepath), 'base64'))
      } catch (err) {
        notFound()
      }
    }
    notFound()
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
    this.getEndpointTree(path.resolve(this.config.endpointPath))

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

  getEndpointTree (filepath, depth = 0) {
    const stats = fs.lstatSync(filepath)
    const regexclude = this.config.endpointPathExclude

    // Skip if excluded from subpaths
    if (depth >= this.config.endpointDepth && filepath.match(regexclude)) {
      return
    }

    // Folder
    if (stats.isDirectory()) {
      fs.readdirSync(filepath).map(child => {
        return this.getEndpointTree(`${filepath}/${child}`, ++depth)
      })
    }

    // File -> Set endpoint config
    else {
      let Endpoint, endpoint, route, custom

      // If the file isn't an endpoint, we'll just use the endpoint parent
      // instead. This works for special endpoints like the cubic-ui sites, since
      // they all use the same main function.
      try {
        Endpoint = require(filepath)
        endpoint = new Endpoint().schema
      } catch (err) {
        Endpoint = require(this.config.endpointParent)
        endpoint = new Endpoint().schema
        custom = true
      }
      const ext = this.config.endpointExtension
      const root = path.resolve(this.config.endpointPath)

      // Sometimes we need to get endpoints from two folders, so this will remove
      // the given number of levels of folder names before the endpoint, which
      // means that their URL looks as if they're in the same folder.
      if (this.config.endpointDepth) {
        const paths = filepath.replace(root, '').split('/')
        const depth = this.config.endpointDepth + 1 // +1 because of leading `/`
        route = '/' + paths.slice(depth, paths.length).join('/')
      }

      // Prepare endpoint attributes.
      endpoint.name = path.basename(filepath).replace(ext, '')
      endpoint.file = custom ? this.config.endpointParent : filepath

      // Generate final route which will be matched against.
      route = (route || endpoint.file.replace(root, '')).replace(ext, '').replace('index', '')
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
