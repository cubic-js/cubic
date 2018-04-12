/**
 * Simulate express response object here
 * Exposes functions which are effectively similar to the original, but differ
 * in implementation, since we'll just tell our API connection to send a
 * response to the API that leads to a response to the user for the given
 * request.
 */
class Response {
  constructor (resolve, api) {
    this.resolve = resolve
    this.api = api
    this.res = {
      statusCode: 200,
      body: ''
    }
  }

  async emit (data, method) {
    if (!this.sent) {
      this.res.body = await data
      this.res.method = method
      this.sent = true
      this.resolve(this.res)
    }
    return true
  }

  send (data) {
    return this.emit(data, 'send')
  }

  json (data) {
    return this.emit(JSON.stringify(data), 'json')
  }

  redirect (status, data) {
    this.res.statusCode = typeof status === 'number' ? status : 302
    data = typeof status === 'number' ? data : status
    return this.emit(data, 'redirect')
  }

  status (code) {
    this.res.statusCode = code
    return this
  }
}

module.exports = Response
