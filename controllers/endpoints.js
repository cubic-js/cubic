/**
 * Module Dependencies
 */
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const decache = require('decache')
const _ = require('lodash')
const mongodb = require('mongodb').MongoClient
const Response = require('../lib/response.js')
const Limiter = require('../lib/limiter.js')

/**
 * Interface for handling endpoints
 */
class EndpointController {
  /**
   * Initialize Connections used by individual endpoints
   */
  constructor() {
    this.db = mongodb.connect(blitz.config[blitz.id].mongoUrl)
    this.limiter = new Limiter()
    this.generateEndpointSchema()
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
    let filename = blitz.config[blitz.id].publicPath + req.url
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
      req.url = req.url === '' ? '/' : req.url.split('%20').join(' ')
      const res = new Response(resolve, api)
      const endpointSchema = this.findByUrl(req.url)
      const limited = await this.limiter.check(req, endpointSchema)
      if (limited) {
        return res.status(429).send(limited)
      }

      this.parse(req, endpointSchema)
      const unauthorized = this.authorizeRequest(req, endpointSchema)
      const Endpoint = require(endpointSchema.file)
      const endpoint = new Endpoint(api, await this.db, req.url)

      // Apply benchmarking functions if benchmark=true
      if (req.query.benchmark && blitz.config.local.environment === 'development') {
        this.benchmarkify(Endpoint, endpoint, res)
      }

      // Apply to endpoint
      if (!unauthorized) {
        endpoint.main.apply(endpoint, [req, res])
          .catch(err => {
            if (blitz.config.local.environment === 'development') {
              console.log(err)
            }
            res.status(500).send(err)
          })
      } else {
        resolve(unauthorized)
      }
    })
  }

  /**
   * Dynamically benchmark the execution time of each function in the endpoint
   */
  benchmarkify(Endpoint, endpoint, res) {
    let _res = _.cloneDeep(res)
    let benchmark = {}

    // Disable publish and caching
    endpoint.publish = () => {}
    endpoint.cache = () => {}

    // Override original res.send so it won't be triggered in original function
    res.send = (data) => {
      // error? pass it through, otherwise do nothing
      if (res.statusCode >= 400) {
        res.send(data)
      } else {}
    }

    Object.getOwnPropertyNames(Endpoint.prototype).forEach(property => {
      if (property !== 'constructor') {
        const _fn = endpoint[property]

        endpoint[property] = function() {
          const t0 = process.hrtime()
          const value = _fn.apply(endpoint, arguments)

          // Wait for promise before updating timers
          if (value && value.then) {
            value.then(() => {
              const t1 = process.hrtime(t0)
              benchmark[property] = `${(t1[0] * 1e9 + t1[1]) / 1e6}ms`
              if (property === 'main') {
                _res.send(benchmark)
              }
            })
          }

          // Update timers immediately
          else {
            const t1 = process.hrtime(t0)
            benchmark[property] = `${(t1[0] * 1e9 + t1[1]) / 1e6}ms`
            if (property === 'main') {
              _res.send(benchmark)
            }
          }
          return value
        }
      }
    })
  }

  /**
   * Check request method and authorization before processing request
   */
  authorizeRequest(req, endpoint) {
    if (!req.user.scp.includes(endpoint.scope) && !req.user.scp.includes('write_root')) {
      return {
        statusCode: 403,
        body: {
          error: 'Unauthorized',
          reason: `Expected ${endpoint.scope}, got ${req.user.scp}.`
        },
        method: 'send'
      }
    }
    if (req.method.toLowerCase() !== endpoint.method.toLowerCase()) {
      return {
        statusCode: 405,
        body: {
          error: 'Method not allowed.',
          reason: `Expected ${endpoint.method}, got ${req.method}.`
        },
        method: 'send'
      }
    }
  }

  /**
   * Generates flat endpoint schema from endpoint tree
   */
  generateEndpointSchema() {
    this.endpoints = []
    this.getEndpointTree(blitz.config[blitz.id].endpointPath)

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
      let route = endpoint.file.replace(blitz.config[blitz.id].endpointPath, '').replace('.js', '')
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
      const stat = await check(blitz.config[blitz.id].publicPath + url)
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
      let route = endpoint.route.split('/')

      // Remove trailing empty el from `/` at end of route, but not if url is
      // '/' (index)
      if (!route[route.length - 1] && route.length > 2) route.pop()
      if (route.length === reqUrl.length) {
        for (let i = 0; i < reqUrl.length; i++) {

          if (route[i] !== reqUrl[i] && !route[i].includes(':')) {
            break
          } else if (i === reqUrl.length - 1) {
            found = endpoint
          }
        }
        if (found) break
      }
    }
    return found
  }

  /**
   * Parse URL to assign placeholder data in case of socket.io connections
   */
  parse(req, endpoint) {
    let placeholders = endpoint.route.split(':').length - 1
    this.parseParams(req, endpoint)
    this.parseQuery(req, endpoint)
  }

  /**
   * Put placeholders from url into req.params
   * E.g. /users/:id/tasks -> req.params.id holds the data in place of :id
   */
  parseParams(req, endpoint) {
    let eurl = endpoint.route.split('/')
    let curl = req.url.split('/')

    for (let i = 0; i < eurl.length; i++) {
      let fragment = eurl[i]
      if (fragment.includes(':')) {
        req.params[fragment.replace(":", "")] = curl[i]
      }
    }
  }

  /**
   * Put query params into req.query
   * E.g. /someroute?test=Kappa123 -> req.query.test = Kappa123
   */
  parseQuery(req, endpoint) {
    let regex = /(\?)([^=]+)\=([^&]+)/
    let url = req.url
    let matching = regex.exec(url)

    while (matching) {
      let key = matching[2]
      for (let i = 0; i < endpoint.query.length; i++) {
        if (key === endpoint.query[i].name) {
          req.query[key] = matching[3]
        }
      }
      url = url.replace(matching[0], '').replace('&', '?')
      matching = regex.exec(url)
    }

    this.parseQueryTypes(req, endpoint)
  }

  /**
   * Convert string params from URL to target type
   */
  parseQueryTypes(req, endpoint) {
    endpoint.query.forEach(query => {
      let def = typeof query.default === 'function' ? query.default() : query.default
      let key = query.name

      // Convert value to target type
      if (req.query[key]) {
        if (typeof def === 'number') {
          req.query[key] = parseFloat(req.query[key])
        }
        if (typeof def === 'boolean') {
          req.query[key] = req.query[key] == 'true' || req.query[key] == '1'
        }
        if (typeof def === 'object') {
          req.query[key] = JSON.stringify(req.query[key])
        }
      }

      // No value given, use default
      else {
        req.query[key] = def
      }
    })
  }
}

module.exports = EndpointController
