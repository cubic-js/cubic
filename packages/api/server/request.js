const path = require('path')
const Url = require('url')
const { promisify } = require('util')
const fs = require('fs')
const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
  const r = Math.random() * 16 | 0
  const v = c === 'x' ? r : (r & 0x3 | 0x8)
  return v.toString(16)
})

class Request {
  constructor (config, cache) {
    this.config = config
    this.requestIds = 1
    this.pending = []
    this.pub = cache.redis.duplicate()
    this.sub = cache.redis.duplicate()
    this.sub.subscribe('check')
    this.sub.subscribe('req')

    // Global subscription handler, so we won't add listeners on every request.
    this.sub.on('message', async (channel, message) => {
      const data = JSON.parse(message)
      const i = this.pending.findIndex(r => r.id === channel)
      const pending = this.pending[i]

      // Server to Client
      if (channel === 'check') {
        const qualified = this.findByUrl(this.client.nodes, data.req)
        if (qualified.length) this.pub.publish(data.id, JSON.stringify({ node: uuid }))
      }
      if (channel === 'req') {
        if (data.node === uuid) {
          const res = await this.getResponse(data.req, true)
          this.pub.publish(data.id, JSON.stringify({ data: res }))
        }
      }

      // Client to Server
      if (pending) {
        this.pending.splice(i, 1)
        this.sub.unsubscribe(channel)
        pending.resolve(pending.type === 'check' ? data.node : data.data)
      }
    })
  }

  async getResponse (req, external) {
    const { node, endpoint } = this.getTargetNode(req)

    // Found locally connected node serving endpoint.
    if (node) {
      return new Promise(resolve => {
        const id = `${req.user.uid}-${req.url}-${this.requestIds++}`
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

    // Nothing found so far -> Check if other API nodes have the endpoint.
    if (!external) {
      const externalNode = await this.getExternalNode(req)
      if (externalNode) {
        return this.getExternalData(externalNode, req)
      }
    }

    // Still here? Means nothing was found.
    return {
      statusCode: 404,
      method: 'send',
      body: {
        error: 'Not found.',
        reason: ``
      }
    }
  }

  getTargetNode (req) {
    const nodes = this.client.nodes
    const qualified = this.findByUrl(nodes, req)
    let target

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
    }

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

  /**
   * Checks if nodes connected to redis have the target URL
   */
  getExternalNode (req) {
    const id = `${req.user.uid}-${req.url}-${this.requestIds++}`
    this.sub.subscribe(id)

    return new Promise(resolve => {
      this.pending.push({ id, type: 'check', resolve })
      this.pub.publish('check', JSON.stringify({ req, id }))

      // Assume nobody has the endpoint if checks take more than x seconds
      setTimeout(() => {
        const i = this.pending.findIndex(r => r.id === id)
        this.pending.splice(i, 1)
        this.sub.unsubscribe(id)
        resolve()
      }, this.config.checkTimeout)
    })
  }

  /**
   * If a node is confirmed to have the target url, send an actual request
   */
  getExternalData (node, req) {
    const id = `${req.user.uid}-${req.url}-${this.requestIds++}`
    this.sub.subscribe(id)

    return new Promise(resolve => {
      this.pending.push({ id, type: 'req', resolve })
      this.pub.publish('req', JSON.stringify({ req, id, node }))
    })
  }
}

module.exports = Request
