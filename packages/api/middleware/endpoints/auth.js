class Auth {
  /**
   * Check user scope before processing request
   */
  verify (req, res, endpoint) {
    if (endpoint.scope && !req.user.scp.includes(endpoint.scope) && !req.user.scp.includes('write_root')) {
      res.status(403).send({
        error: 'Unauthorized',
        reason: `Expected ${endpoint.scope}, got ${req.user.scp}.`
      })
      return true
    }
  }
}

module.exports = new Auth()
