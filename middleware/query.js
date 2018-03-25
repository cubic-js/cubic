class Query {
  /**
   * Verify that all required query params are actually present.
   */
  verify (req, res, endpoint) {
    for (let param of endpoint.query) {
      if (param.required && !req.query[param.name]) {
        return res.status(400).send({
          error: 'Missing query param.',
          reason: `Expected ${param.name} param. Your URL should look something like: ${req.url}${req.url.includes('?') ? '&' : '?'}${param.name}=${param.default ? param.default : 'value'}`
        })
      }
    }
  }
}

module.exports = new Query()