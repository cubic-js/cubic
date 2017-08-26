/**
 * Module Dependencies
 */
const fs = require('fs')
const path = require('path')
const util = require('util')
const _ = require('lodash')
const mongodb = require('mongodb').MongoClient
const CircularJSON = require('circular-json')
const Response = require('../lib/response.js')

/**
 * Interface for handling endpoints
 */
class EndpointController {
  /**
   * Initialize Connections used by individual endpoints
   */
  constructor () {
    this.db = mongodb.connect(blitz.config[blitz.id].mongoURL)
    this.generateEndpointSchema()
  }

  /**
   * Calls endpoint with given param Array
   */
  async getResponse (req, api) {
    try {
      return await this.sendRaw(req, api)
    } catch (err) {
      return await this.callEndpoint(req, api)
    }
  }

  /**
   * Send raw file if available
   */
  async sendRaw (req, api) {
    let readFile = util.promisify(fs.readFile)
    let filename = blitz.config[blitz.id].publicPath + req.url
    let raw = await readFile(filename)

    api.emit('cache', {
      scope: '',
      key: req.url,
      value: raw,
      exp: blitz.config[blitz.id].cacheDuration
    })
    return {
      body: raw
    }
  }

  /**
   * Calls endpoint with given param Array
   */
  async callEndpoint (req, api) {
    req.url = req.url === '' ? '/' : req.url.replace('%20', '')
    const endpointSchema = this.findByUrl(req.url)
    this.parse(req, endpointSchema)
    const invalid = this.authorizeRequest(req, endpointSchema)
    const Endpoint = require(endpointSchema.file)
    const endpoint = new Endpoint(api, await this.db, req.url)
    const res = new Response(api)

    // Apply to endpoint
    if (!invalid) {
      return endpoint.main.apply(endpoint, [req, res])
        .then(data => {
          return {
            statusCode: data.statusCode,
            method: data.method,
            body: data.body || data
          }
        })
        .catch(err => {
          if (blitz.config.local.environment === 'development') {
            console.log(err)
          }
          return {
            statusCode: err.statusCode || 400,
            method: err.method,
            body: err.body || err
          }
        })
    } else {
      return invalid
    }
  }

  /**
   * Get specific endpoint through url detection
   */
  findByUrl (url) {
    let found = true
    let reqUrl = url.split('?')[0].split('/')

    for (let endpoint of this.endpoints) {
      let route = endpoint.route.split('/')
      if (route.length === reqUrl.length) {
        for (let i = 0; i < reqUrl.length; i++) {
          if (route[i] !== reqUrl[i] && !route[i].includes(':')) {
            found = false
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
   * Check request method and authorization before processing request
   */
  authorizeRequest (req, endpoint) {
    if (!req.user.scp.includes(endpoint.scope) && !req.user.scp.includes('root-read-write')) {
      return {
        statusCode: 401,
        body: {
          error: 'Unauthorized',
          reason: `Expected ${endpoint.scope}, got ${req.user.scp}.`
        }
      }
    }
    if (req.method.toLowerCase() !== endpoint.method.toLowerCase()) {
      return {
        statusCode: 405,
        body: {
          error: 'Method not allowed.',
          reason: `Expected ${endpoint.method}, got ${req.method}.`
        }
      }
    }
  }

  /**
   * Generates flat endpoint schema from endpoint tree
   */
  generateEndpointSchema () {
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
  getEndpointTree (filename) {
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
  async getEndpoint (url) {
    // Try to get raw file in public folder
    try {
      if (url.includes('../')) {
        throw 'Attempt to navigate outside of public folder not permitted.'
      }
      let check = util.promisify(fs.stat)
      await check(blitz.config[blitz.id].publicPath + url)
    }

    // Assume dynamic endpoint if file not available
    catch (err) {
      let path = this.findByUrl(url).file
      return require(path)
    }
  }

  /**
   * Parse URL to assign placeholder data in case of socket.io connections
   */
  parse (req, endpoint) {
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
  parseQueryTypes (req, endpoint) {
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
