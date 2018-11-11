const jwt = require('jsonwebtoken')

class WsMiddleware {
  constructor (config) {
    this.config = config
  }

  authorize (req, done) {
    const ip = req.forwarded.ip
    const auth = req.headers.authorization || req.query.bearer
    req.user = {
      uid: ip,
      scp: ''
    }

    if (auth) {
      const token = auth.replace(/bearer /i, '')

      try {
        req.user = jwt.verify(token, this.config.certPublic)
        this.log(`${ip} connected as ${req.user.uid}`)
        return done()
      }

      // Invalid token
      catch (err) {
        this.log(`${req.user.uid} rejected (${err})`)
      }
    }

    // No token provided
    else {
      this.log(`${req.user.uid} connected without token`)
      return done()
    }
  }

  /**
   * Check for JWT expiration on each request additionally.
   */
  verifyToken (req, res) {
    if (new Date().getTime() / 1000 - req.user.exp > 0) {
      this.log(`${req.user.uid} rejected (jwt expired)`)
      return res.status(401).send({
        error: 'Invalid Token.',
        reason: 'jwt expired'
      })
    } else {
      return true
    }
  }

  log (msg) {
    cubic.log.verbose(`${this.config.prefix} | (ws) ${msg}`)
  }
}

module.exports = WsMiddleware
