/**
 * Simulate express response object here
 * Exposes functions which are effectively similar to the original, but differ
 * in implementation
 */
class Response {
  constructor(resolve, api) {
    this.resolve = resolve
    this.api = api
    this.res = {
      statusCode: 200,
      body: ''
    }
  }

  async emit(data, method) {
    if (!this.sent) {
      this.res.body = await data
      this.res.method = method
      this.resolve(this.res)
    }
  }

  send(data) {
      this.emit(data, 'send')
  }

  json(data) {
    this.emit(JSON.stringify(data), 'json')
  }

  redirect(status, data) {
    this.res.statusCode = typeof status === 'number' ? status : 302
    data = typeof status === 'number' ? data : status
    this.emit(data, 'redirect')
  }

  status(code) {
    this.res.statusCode = code
    return this.res
  }
}

module.exports = Response
