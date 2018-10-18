class ServerError extends Error {
  constructor ({ statusCode, body }, query) {
    const error = body.error ? body.error + `(${body.reason})` : body
    super(`Cubic-client encountered an error while requesting ${query.url || query}: ${statusCode} - ${error}`)
    this.statusCode = statusCode
    this.reason = body.reason
    this.error = body.error
  }
}

module.exports = ServerError
