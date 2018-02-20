/**
 * Module Dependencies
 */
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const decache = require('decache')
const _ = require('lodash')
const mongodb = require('mongodb').MongoClient
const Stack = require('async-middleware-stack')
const Response = require('../lib/response.js')
const Limiter = require('../middleware/limiter.js')
const url = require('../middleware/url.js')
const auth = require('../middleware/auth.js')
const method = require('../middleware/method.js')

/**
 * Interface for handling endpoints
 */
class EndpointController {
  /**
   * Initialize Connections used by individual endpoints
   */
  constructor(config) {
    this.config = config
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
  applyMiddleware() {
    this.stack.use(this.limiter.check.bind(this.limiter))
    this.stack.use(url.parse.bind(url))
    this.stack.use(auth.verify.bind(auth))
    this.stack.use(method.verify.bind(method))
  }

  /**
   * Calls endpoint with given param Array
   */
  async getResponse(req, api) {
    try {
      return await this.sendRaw(req, api)
    } catch (err) {
      return await this.callEndpoint(req, api)
    }
  }

  /**
   * Send raw file if available
   */
  async sendRaw(req, api) {
    let readFile = promisify(fs.readFile)
    let filename = this.config.publicPath + req.url
    let raw = await readFile(filename)

    api.emit('cache', {
      scope: '',
      key: req.url,
      value: raw,
      exp: 60 // 1 minute
    })
    return {
      statusCode: 200,
      body: raw,
      method: 'send'
    }
  }

  /**
   * Calls endpoint with given param Array
   */
  async callEndpoint(req, api) {
    return new Promise(async resolve => {
      const res = new Response(resolve, api)
      const endpoint = this.findByUrl(req.url)

      try {
        await this.stack.run(req, res, endpoint)

        // Generate target endpoint
        const db = (await this.db).db(this.config.mongoDb)
        const Component = require(endpoint.file)
        const component = new Component(api, db, req.url)

        // Apply request to endpoint
        if (!res.sent) {
          await component.main(req, res)
        }
      } catch (err) {
        if (err instanceof Error) {
          throw err
        }
      }
    })
  }

  /**
   * Generates flat endpoint schema from endpoint tree
   */
  generateEndpointSchema() {
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

  /**
   * Generates endpoint tree
   */
  getEndpointTree(filename) {
    let stats = fs.lstatSync(filename)
    let endpoint = {}

    // Folder
    if (stats.isDirectory()) {
      fs.readdirSync(filename).map(child => {
        return this.getEndpointTree(filename + '/' + child)
      })
    }

    // File -> Set endpoint config
    else {
      let Endpoint = require(filename.replace('//', '/'))
      let endpoint = new Endpoint().schema

      // Routes
      endpoint.name = path.basename(filename).replace('.js', '')
      endpoint.file = filename
      let route = endpoint.file.replace(this.config.endpointPath, '').replace('.js', '')
      endpoint.route = endpoint.url ? endpoint.url : route
      this.endpoints.push(endpoint)
    }
  }

  /**
   * Get Endpoint from given URL
   */
  async getEndpoint(url) {
    // Try to get raw file in public folder
    try {
      if (url.includes('../')) {
        throw 'Attempt to navigate outside of public folder not permitted.'
      }
      let check = promisify(fs.stat)
      const stat = await check(this.config.publicPath + url)
      if (stat.isDirectory()) {
        throw 'Can\'t send a full directory. Make sure to specify a file instead.'
      }
    }

    // Assume dynamic endpoint if file not available
    catch (err) {
      const dev = blitz.config.local.environment === 'development'

      // Regenerate endpoints in dev mode so we needn't restart the full stack
      // for changes
      dev ? this.generateEndpointSchema() : null

      // Get file path for our endpoint
      let path = this.findByUrl(url).file

      // Remove node's require cache while in dev mode so we needn't restart
      // to see endpoint changes
      dev ? decache(path) : null

      return require(path)
    }
  }

  /**
   * Get specific endpoint through url detection
   */
  findByUrl(url) {
    url = url === '' ? '/' : url.split('%20').join(' ')
    let found = false
    let reqUrl = url.split('?')[0].split('/')

    for (let endpoint of this.endpoints) {
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
