/**
 * Redis Client for rate limiting
 */
const Redis = require('redis')

/**
 * Rolling Rate Limiting
 */
const RateLimiter = require('rolling-rate-limiter')

/**
 * Rolling Rate limiting Implementation
 * See https://engineering.classdojo.com/blog/2015/02/06/rolling-rate-limiter/
 * for a detailed explanation.
 */
class Limiter {
  constructor() {
    this.redis = Redis.createClient(blitz.config[blitz.id].redisUrl)
  }

  /**
   * Check if user has exceeded their rate limits for this endpoint
   */
  async check (req, endpoint) {

    // User is root -> skip limiting
    if (req.user.scp.includes('write_root') ||
        req.user.scp.includes('ignore_rate_limit') ||
        endpoint.limit.disable) {
      return false
    }

    // Limit with rate specified in endpoint
    return new Promise(resolve => {
      const limit = RateLimiter(Object.assign({
        redis: this.redis,
        namespace: 'rate-limiter'
      }, endpoint.limit))

      // Cached value is `uid + url` e.g. nakroma/v1/foo/bar
      limit(req.user.uid + endpoint.route, (err, time, actions) => {
        this.limit(err, time, actions, resolve)
      })
    })
  }

  /**
   * Rate limit function logic
   */
  limit (err, time, actions, resolve) {

    // Return any errors
    if (err) {
      resolve(err)
    }

    // Limit Rate if necessary
    else if (time) {
      if (actions > 0) {
        err = {
          error: 'Rate limit exceeded.',
          reason: `Request intervals too close. You need to wait ${time + 1000}ms to continue.`
        }
      } else {
        err = {
          error: 'Rate limit exceeded.',
          reason: `Max requests per interval reached. You need to wait ${time + 1000}ms to continue.`
        }
      }
      resolve(err)
    }

    // Otherwise allow request
    else {
      resolve(false)
    }
  }
}

module.exports = Limiter
