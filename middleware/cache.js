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
  async save (key, headers, data, exp = this.config.cacheExp, scope) {
    data = JSON.stringify({
      data,
      headers,
      scope
    })
    key = encodeURI(key)
    cubic.log.verbose(`${this.config.prefix} | < caching data for ${key}`)
    return promisify(this.redis.setex).bind(this.redis)(key, exp, data)
  }

  /**
   * Middleware function. Respond if data present, Next if not
   */
  async check (req, res) {
    let cached = await this.get(req.url)

    if (cached) {
      // Authorized
      if (!cached.scope || req.user.scp.includes(cached.scope)) {
        res.send(cached.data, cached.headers)
        return true // break middleware stack
      }

      // Unauthorized, reject
      else {
        return res.status(401).send({
          error: 'Unauthorized for cached data.',
          reason: `Expected scope: ${cached.scope}. Got ${req.user.scp}.`
        })
      }
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
