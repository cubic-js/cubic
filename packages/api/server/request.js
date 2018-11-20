const path = require('path')
const Url = require('url')
const { promisify } = require('util')
const fs = require('fs')
const randtoken = require('rand-token')

class Request {
  constructor (config, cache) {
    this.config = config
    this.uuid = `${config.group}-${randtoken.uid(16)}`
    this.requestIds = 1
    this.pending = []
    this.pub = cache.redis.duplicate()
    this.sub = cache.redis.duplicate()
    this.sub.subscribe('check')
    this.sub.subscribe('req')

    // Global subscription handler for API-to-API communication, so we won't add
    // listeners on every request.
    this.sub.on('message', async (channel, message) => {
      const data = JSON.parse(message)
      const i = this.pending.findIndex(r => r.id === channel)
      const pending = this.pending[i]

      // Server to Client
      if (channel === 'check') {
        if (data.uuid.split('-')[0] === this.config.group &&
            data.uuid !== this.uuid &&
            data.req.adapter === this.protocol) {
          this.log(`< check - Received ${data.req.method} ${data.req.url}`)
          const qualified = this.findByUrl(this.adapter.nodes, data.req)

          if (qualified.length) {
            this.log(`> check - Send ${data.req.method} ${data.req.url}`)
            this.pub.publish(data.id, JSON.stringify({ node: this.uuid }))
          }
        }
      }
      if (channel === 'req') {
        if (data.node === this.uuid && data.req.adapter === this.protocol) {
          this.log(`< request - Received ${data.req.method} ${data.req.url}`)
          const res = await this.getResponse(data.req, true)
          this.log(`> request - Send ${data.req.method} ${data.req.url}`)
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
        this.log(`< request - Found local ${req.url}`)

        function respond (data) {
          if (data.action === 'RES' && data.id === id) {
            node.spark.removeListener('data', respond)
            resolve(data.res)
          }
        }
        node.spark.write({ action: 'REQ', req, endpoint, id })
        node.spark.on('data', data => respond(data))
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
        this.log(`< check - Found external ${req.url}`)
        const data = await this.getExternalData(externalNode, req)
        this.log(`< request - Received ${req.url}`)
        return data
      }
    }

    // Still here? Means nothing was found.
    return {
      statusCode: 404,
      method: 'send',
      body: {
        error: 'Not found.',
        reason: `Couldn't find ${req.url} on this node and no other node responded in time.`
      }
    }
  }

  getTargetNode (req) {
    const nodes = this.adapter.nodes
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
      this.pub.publish('check', JSON.stringify({ req, id, uuid: this.uuid }))

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

  log (msg) {
    cubic.log.silly(`${this.config.prefix} | (${this.uuid}) ${msg}`)
  }
}

module.exports = Request
