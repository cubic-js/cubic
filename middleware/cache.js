const { promisify } = require('util')

class CacheController {
  constructor (config, redis) {
    this.config = config
    this.redis = redis
    this.redis.select(this.config.cacheDb)
  }

  /**
   * Saves string as key value
   */
  async save (key, value, exp = this.config.cacheExp, scope) {
    value = JSON.stringify({
      data: value,
      type: typeof value,
      scope: scope
    })
    key = encodeURI(key)
    cubic.log.verbose(`${this.config.prefix} | < caching data for ${key}`)
    return promisify(this.redis.setex).bind(this.redis)(key, exp, value)
  }

  /**
   * Middleware function. Respond if data present, Next if not
   */
  async check (req, res) {
    let url = req.url.split('/')

    // Ignore raw file requests. They should get cached on a CDN.
    if (!url[url.length - 1].split('?')[0].split('.')[1]) {
      let cached = await this.get(req.url)

      if (cached) {
        // Authorized
        if (!cached.scope || req.user.scp.includes(cached.scope)) {
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
  }

  /**
   * Cached data available, respond to request
   */
  respond (cached, req, res) {
    if (cached.type === 'json') {
      return res.json(cached.data)
    } else {
      return res.send(cached.data)
    }
  }

  /**
   * Get Data from cache.
   */
  async get (key) {
    const res = await promisify(this.redis.get).bind(this.redis)(encodeURI(key))
    if (res) {
      cubic.log.verbose(`${this.config.prefix} | > returning cached data for ${key}`)
      return JSON.parse(res)
    }
  }
}

module.exports = CacheController
