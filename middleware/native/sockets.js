const jwt = require('jsonwebtoken')

class SocketMiddleware {
  constructor(config) {
    this.config = config
  }

  /**
   * Verify JWT and add to req.user. This function runs on the initial handshake
   * rather than on a per-request basis.
   */
  verifySocket(socket, next) {
    const ip = socket.handshake.headers['x-forwarded-for'] ||
      socket.handshake.address.address ||
      socket.request.connection.remoteAddress
    socket.user = {
      uid: ip,
      scp: ''
    }

    // Token sent at all?
    if (socket.handshake.query.bearer) {
      let token = socket.handshake.query.bearer

      // Set req.user from token
      try {
        socket.user = jwt.verify(token, this.config.certPublic)
        cubic.log.verbose(`${this.config.prefix} | (ws) ${ip} connected as ${socket.user.uid} on ${socket.nsp.name}`)
        return next()
      }

      // Invalid Token
      catch (err) {
        cubic.log.verbose(`${this.config.prefix} | (ws) ${socket.user.uid} rejected (${err}) on ${socket.nsp.name}`)
        return next({
          error: 'Invalid Token',
          reason: err
        })
      }
    }

    // No Token provided
    else {
      cubic.log.verbose(`${this.config.prefix} | (ws) ${socket.user.uid} connected without token on ${socket.nsp.name}`)
      return next()
    }
  }

  /**
   * Check for JWT expiration on each request additionally.
   */
  verifyExpiration(req, res) {
    if (new Date().getTime() / 1000 - req.user.exp > 0) {
      cubic.log.verbose(`${this.config.prefix} | (ws) ${req.user.uid} rejected (jwt expired)`)
      return res.send({
        error: 'Invalid Token',
        reason: 'jwt expired'
      })
    }
  }

  /**
   * Authorizes sockets attempting connections to higher namespaces
   */
  authorizeRoot(socket, next) {
    if (socket.nsp.name === '/root' && socket.user.scp.includes('root')) {
      return next()
    }

    // No criteria matched
    cubic.log.verbose(`${this.config.prefix} | (ws) Rejected connection to ${socket.nsp.name}`)
    return next(new Error(`Rejected connection to ${socket.nsp.name}`))
  }
}

module.exports = SocketMiddleware