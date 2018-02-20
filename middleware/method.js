class Method {
  /**
   * Verify matching request method before proceeding
   */
  verify (req, res, endpoint) {
    if (req.method.toLowerCase() !== endpoint.method.toLowerCase()) {
      return res.status(405).send({
        error: 'Method not allowed.',
        reason: `Expected ${endpoint.method}, got ${req.method}.`
      })
    }
  }
}

module.exports = new Method