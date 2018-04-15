class ServerError extends Error {
  constructor ({ statusCode, reason, error }, query) {
    super(`Cubic-client encountered an error while requesting ${query}: ${statusCode} - ${reason}`)
    this.statusCode = statusCode
    this.reason = reason
    this.error = error
  }
}

export default ServerError
