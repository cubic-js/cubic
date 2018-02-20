const redis = require('redis')
const mime = require('mime')

class CacheController {
  constructor (config) {
    this.config = config
    this.client = redis.createClient(this.config.redisUrl)
    this.client.select(this.config.cacheDb)
  }

  /**
   * Saves string as key value
   */
  save (key, value, exp = this.config.cacheExp, scope) {
    value = JSON.stringify({
      data: value,
      type: typeof value,
      scope: scope
    })
    key = key.toLowerCase().split(' ').join('%20')
    blitz.log.verbose(`${this.config.prefix} | < caching data for ${key}`)
    this.client.setex(key, exp, value)
  }

  /**
   * Middleware function. Respond if data present, Next if not
   */
  async check (req, res) {
    let cached = await this.get(req.url)

    if (cached) {
      // Authorized
      if (req.user.scp.includes(cached.scope)) {
        return this.respond(cached, req, res)
      }

      // Unauthorized, reject
      else {
        return res.status(401).json({
          error: 'Unauthorized for cached data.',
          reason: `Expected scope: ${cached.scope}. Got ${req.user.scp}.`
        })
      }
    }
  }

  /**
   * Cached data available, respond to request
   */
  respond (cached, req, res) {
    let url = req.url.split('/')

    // File extension in URL? Send raw file as base64 buffer.
    if (url[url.length - 1].split('?')[0].split('.')[1]) {
      let bufferData = new Buffer(cached.data, 'base64')
      res.header('content-type', mime.getType(req.url))
      res.end(bufferData)
    }

    // Primitive data type / objects
    else {
      if (cached.type === 'json') {
        return res.json(cached.data)
      } else {
        return res.send(cached.data)
      }
    }
  }

  /**
   * Get Data from cache. If not present, have it calculated
   */
  get (key) {
    return new Promise((resolve, reject) => {
      key = key.toLowerCase().split(' ').join('%20')
      this.client.get(key, (err, res) => {
        if (res) {
          blitz.log.verbose(`${this.config.prefix} | > returning cached data for ${key}`)
          resolve(JSON.parse(res))
        } else resolve(null)
      })
    })
  }
}

module.exports = CacheController
