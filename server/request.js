const path = require('path')
const Url = require('url')
const { promisify } = require('util')
const fs = require('fs')
let starting = true // Don't send 404 when no nodes are connected at start.

class Request {
  constructor (config) {
    this.config = config
    this.requestIds = 1
  }

  async getResponse (req) {
    // Assume endpoint request.
    const { node, endpoint, busy } = this.getTargetNode(req)

    if (busy) {
      return {
        statusCode: 503,
        method: 'send',
        body: {
          error: 'All nodes currently busy.',
          reason: 'Our servers are on fire 🔥'
        }
      }
    }
    else if (node) {
      if (starting) starting = false // No longer send startup warning with 503

      return new Promise(resolve => {
        const id = `${req.url}-${this.requestIds++}`
        function respond (data) {
          if (data.action === 'RES' && data.id === id) {
            node.spark.removeListener('data', respond)
            resolve(data.res)
          }
        }
        node.spark.write({ action: 'REQ', req, endpoint, id })
        node.spark.on('data', respond)
      })
    }
    // Send raw files locally. We'll assume things run in the same repo.
    // Not 100% in favor of this conceptually, but it works for now.
    else if (path.extname(path.basename(Url.parse(req.url).pathname || ''))) {
      try {
        const readFile = promisify(fs.readFile)
        const filepath = this.config.publicPath + req.url

        return {
          statusCode: 200,
          method: 'send',
          body: Buffer.from(await readFile(filepath), 'base64')
        }
      } catch (err) {}
    }

    // Still here? That means we couldn't find anything.
    starting = starting || this.client.nodes.find(n => !n.endpoints.length)
    return {
      statusCode: starting ? 503 : 404,
      method: 'send',
      body: {
        error: 'Not found.',
        reason: starting ? 'Starting up nodes.' : 'Couldn\'t find what you\'re looking for.'
      }
    }
  }

  getTargetNode (req) {
    const nodes = this.client.nodes
    const qualified = this.findByUrl(nodes, req)
    let target
    let busy = 0

    if (!qualified.length) return {}

    // Return node if one is not busy dealing with pending requests.
    for (const node of qualified) {
      if (!node.pending) target = node
    }

    if (target) return target

    // Return node with the least pending requests. If all nodes have more
    // pending tasks than specified in the config, we return a 503 - busy response.
    for (const node of qualified) {
      if (!target || node.pending.length < target.pending.length) {
        target = node
      }
      if (node.pending >= node.maxPending) {
        busy++
      }
    }

    if (busy === qualified.length) return { busy: true }

    return target
  }

  findByUrl (nodes, req) {
    const { url, method } = req
    const qualified = []
    const safeUrl = url || '/' // When the domain is requested without sub-url
    let reqUrl = safeUrl.split('?')[0].split('/')

    for (const node of nodes) {
      let found = false

      for (const endpoint of node.endpoints) {
        if (endpoint.method !== method) continue
        const route = endpoint.route.split('/')

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
      if (found) qualified.push({ node, endpoint: found.file })
    }
    return qualified
  }
}

module.exports = Request
