class ExpressMiddleware {
  /**
   * Verify JWT signature/expiration date and add user to `req` object.
   */
  auth(req, res, next) {
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
        req.user = jwt.verify(token, blitz.config[blitz.id].certPublic)
        blitz.log.verbose(`HTTP      | ${ip} connected as ${req.user.uid}`)
        return next()
      }

      // Invalid Token
      catch (err) {
        blitz.log.verbose(`HTTP      | ${ip} rejected (${err})`)
        return res.status(400).json({
          error: 'Invalid Token',
          reason: err
        })
      }
    }

    // No token provided
    else {
      blitz.log.verbose(`HTTP      | ${req.user.uid} connected without token`)
      next()
    }
  }
}

module.exports = new ExpressMiddleware