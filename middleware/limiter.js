const Redis = require('redis')
const RateLimiter = require('rolling-rate-limiter')

/**
 * Global rate limiter to prevent any 'accidental' 500 requests per second.
 * This applies to *every* request. Keep in mind that there's another rate
 * limiter on the core worker to apply custom rate limits to individual
 * endpoints.
 */
class Limiter {
  constructor (config) {
    this.config = config
    this.redis = Redis.createClient(config.redisUrl)
  }

  /**
   * Check if user has exceeded their rate limits for this endpoint
   */
  async check (req, res) {
    // User is root -> skip limiting
    if (req.user.scp.includes('write_root') ||
        req.user.scp.includes('ignore_rate_limit')) {
      return
    }

    // Limit with rate specified in endpoint
    const limited = await new Promise(resolve => {
      const limit = RateLimiter(Object.assign({
        redis: this.redis,
        namespace: 'rate-limiter'
      }, this.config.limit))

      // Cached value is `uid + url` e.g. nakroma/v1/foo/bar
      limit(req.user.uid + '-global', (err, time, actions) => {
        this.limit(err, time, actions, resolve)
      })
    })

    // Reject request if limited
    if (limited) {
      res.status(429).send(limited)
      return true
    }
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
