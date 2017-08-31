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
 */
class Limiter {
  /**
   * Rolling Rate Limiting with Redis
   */
  check (req, res, next) {
    // Rate Limiter for privileged scope
    const lowLimit = RateLimiter(Object.assign({
      redis: client,
      namespace: 'LowAccessLimit'
    }, blitz.config[blitz.id].limiter.low))

    // Rate Limiter for registered users
    const midLimit = RateLimiter(Object.assign({
      redis: client,
      namespace: 'MidAccessLimit'
    }, blitz.config[blitz.id].limiter.mid))

    // Rate Limiter for no tokens
    const highLimit = RateLimiter(Object.assign({
      redis: client,
      namespace: 'HighAccessLimit'
    }, blitz.config[blitz.id].limiter.high))

    // No Token provided -> High limit
    if (!req.user.scp) {
      highLimit(req.user.uid, (err, timeLeft, actionsLeft) => this.limit(err, req, res, next, timeLeft, actionsLeft))
    }

    // User is root -> skip limiting
    else if (req.user.scp.includes('write_root') || req.user.scp.includes('ignore_rate_limit')) {
      return next()
    }

    // Token provided & privileged user -> No minDifference
    else if (req.user.scp.includes('low_limit')) {
      lowLimit(req.user.uid, (err, timeLeft, actionsLeft) => this.limit(err, req, res, next, timeLeft, actionsLeft))
    }

    // Token provided & default user -> Enhanced limits, 2req/s
    else if (req.user.scp.includes('basic')) {
      midLimit(req.user.uid, (err, timeLeft, actionsLeft) => this.limit(err, req, res, next, timeLeft, actionsLeft))
    } else return next('Undocumented Authorization Scope. Please contact a developer on our discord server. https://discord.gg/8mCNvKp')
  }

  /**
   * Rate Limit error handling
   */
  limit (err, req, res, next, timeLeft, actionsLeft) {
    // Return any errors
    if (err) {
      return next(new Error('Uncaught Exception'))
    }

    // Limit Rate if necessary
    else if (timeLeft) {
      // Figure out why request got limited
      if (actionsLeft > 0) {
        var err = {
          error: 'Rate limit exceeded.',
          reason: `Request intervals too close. You need to wait ${timeLeft} ms to continue.`
        }
      } else {
        var err = {
          error: 'Rate limit exceeded.',
          reason: `Max requests per interval reached. You need to wait ${timeLeft} ms to continue.`
        }
      }

      // Figure out Source of Request
      if (req.channel === 'Sockets') var prefix = 'Sockets'
      else var prefix = 'REST'

      // Respond with error
      return res.status(429).json(err)
    }

    // Otherwise allow
    else {
      return next()
    }
  }
}

module.exports = new Limiter()
