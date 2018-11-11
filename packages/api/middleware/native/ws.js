const jwt = require('jsonwebtoken')
const localhostExp = new Date().getTime() / 1000 + 60 * 60 * 1

class WsMiddleware {
  constructor (config) {
    this.config = config
  }

  authorize (req, done) {
    const ip = req.forwarded.ip
    const localhostException = ip.includes('127.0.0.1') && new Date() / 1000 < localhostExp
    const auth = req.headers.authorization || req.query.bearer
    req.user = {
      uid: ip,
      scp: ''
    }

    if (localhostException) {
      this.log(`${req.user.uid} connected through localhost exception`)
      req.user.scp = 'write_root'
      req.user.exp = localhostExp
      req.user.localhost = true
      return done()
    }
    else if (auth) {
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
