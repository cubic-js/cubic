class ServerError extends Error {
  constructor ({ statusCode, body }, query) {
    super(`Cubic-client encountered an error while requesting ${query}: ${statusCode} - ${body.error} (${body.reason})`)
    this.statusCode = statusCode
    this.reason = body.reason
    this.error = body.error
  }
}

export default ServerError
