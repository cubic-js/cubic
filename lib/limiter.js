/**
 * Redis Client for rate limiting
 */
const Redis = require('redis')
const client = Redis.createClient()

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
  async check (req, endpoint) {

    // User is root -> skip limiting
    if (req.user.scp.includes('write_root') || req.user.scp.includes('ignore_rate_limit')) {
      return false
    }

    // Limit with rate specified in endpoint
    return new Promise(resolve => {
      this.resolve = resolve
      const limit = RateLimiter(Object.assign({
        redis: client,
        namespace: 'rate-limiter'
      }, endpoint.limit))
      limit(req.user.uid, (err, time, actions) => this.limit(err, time, actions))
    })
  }

  /**
   * Rate Limit error handling
   */
  limit (err, time, actions) {

    // Return any errors
    if (err) {
      this.resolve(err)
    }

    // Limit Rate if necessary
    else if (time) {
      if (actions > 0) {
        err = {
          error: 'Rate limit exceeded.',
          reason: `Request intervals too close. You need to wait ${time} ms to continue.`
        }
      } else {
        err = {
          error: 'Rate limit exceeded.',
          reason: `Max requests per interval reached. You need to wait ${time} ms to continue.`
        }
      }
      this.resolve(err)
    }

    // Otherwise allow
    else {
      this.resolve(false)
    }
  }
}

module.exports = Limiter
