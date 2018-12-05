/**
 * Class describing API endpoint. This will be extended in every custom API
 * endpoint.
 */
class Endpoint {
  constructor (options = {}) {
    this.schema = {
      scope: '',
      method: 'GET',
      query: []
    }
    this.cc = options.cache
    this.ws = options.ws
    this.db = options.db
    this.url = options.url
  }

  async publish (data, endpoint = this.url) {
    cubic.log.verbose('Core      | Sending data to publish for ' + endpoint)
    this.ws.app.room(endpoint).write({
      action: 'PUBLISH',
      room: endpoint,
      data
    })
  }

  async cache (value, exp, headers, key = this.url) {
    cubic.log.verbose('Core      | Sending data to cache for ' + key)
    this.cc.save(key, headers, value, exp, this.schema.scope)
  }
}

module.exports = Endpoint
