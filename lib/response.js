/**
 * Simulate express response object here
 * Exposes functions which are effectively similar to the original, but differ
 * in implementation
 */
class Response {
  constructor(api) {
    this.api = api
  }
}

module.exports = Response
