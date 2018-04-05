const jwt = require('jsonwebtoken')

class ExpressMiddleware {
  constructor (config) {
    this.config = config
  }

  /**
   * Verify JWT signature/expiration date and add user to `req` object.
   */
  auth (req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    req.user = {
      uid: ip,
      scp: ''
    }

    // Token present?
    if (req.headers.authorization) {
      let token = req.headers.authorization.replace(/bearer /i, '')

      // Set req.user from token
      try {
        req.user = jwt.verify(token, this.config.certPublic)
        cubic.log.verbose(`${this.config.prefix} | (http) ${ip} connected as ${req.user.uid}`)
        return next()
      }

      // Invalid Token
      catch (err) {
        cubic.log.verbose(`${this.config.prefix} | (http) ${ip} rejected (${err})`)
        return res.status(400).json({
          error: 'Invalid Token',
          reason: err
        })
      }
    }

    // No token provided
    else {
      cubic.log.verbose(`${this.config.prefix} | (http) ${req.user.uid} connected without token`)
      return next()
    }
  }

  decode (req, res, next) {
    req.url = req.url === '' ? '/' : decodeURI(req.url)
    next()
  }
}

module.exports = ExpressMiddleware