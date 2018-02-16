class SocketMiddleware {
  /**
   * Verify JWT and add to req.user. This function runs on the initial handshake
   * rather than on a per-request basis.
   */
  verifySocket(socket, next) {
    let ip = socket.handshake.headers['x-forwarded-for'] ||
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
        socket.user = jwt.verify(token, blitz.config[blitz.id].certPublic)
        blitz.log.verbose(`Socket.io | ${ip} connected as ${socket.user.uid} on ${socket.nsp.name}`)
        return next()
      }

      // Invalid Token
      catch (err) {
        blitz.log.verbose(`Socket.io | ${socket.user.uid} rejected (${err}) on ${socket.nsp.name}`)
        return next({
          error: 'Invalid Token',
          reason: err
        })
      }
    }

    // No Token provided
    else {
      blitz.log.verbose(`Socket.io | ${socket.user.uid} connected without token on ${socket.nsp.name}`)
      return next()
    }
  }

  /**
   * Check for JWT expiration on each request additionally.
   */
  verifyExpiration(req, res, next) {
    if (new Date().getTime() / 1000 - req.user.exp > 0) {
      blitz.log.verbose(`Socket.io | ${req.user.uid} rejected (jwt expired)`)
      return next({
        error: 'Invalid Token',
        reason: 'jwt expired'
      })
    } else {
      return next()
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
    blitz.log.verbose('Socket.io | Rejected connection to ' + socket.nsp.name)
    return next(new Error(`Rejected connection to ${socket.nsp.name}`))
  }
}

module.exports = new SocketsMiddleware