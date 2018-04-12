/**
 * Class describing generic database/calculation methods
 * Any lower-level method extends this class
 */
class Endpoint {
  constructor (api, db, url) {
    this.schema = {
      scope: '',
      method: 'GET',
      description: 'There is no description for this endpoint yet.',
      query: []
    }
    this.api = api
    this.db = db
    this.url = url
  }

  /**
   * Publish Data for a specific endpoint
   */
  publish (data, endpoint = this.url) {
    const id = `publish-${this.url}-${process.hrtime().join('').toString()}`
    const update = { endpoint, data, id }

    this.api.emit('publish', update)
    cubic.log.verbose('Core      | Sending data to publish for ' + endpoint)
    return new Promise(resolve => this.api.on(id, resolve))
  }

  /**
   * Send data to be cached for endpoint on API node
   */
  cache (value, exp, key = this.url) {
    const id = `cache-${this.url}-${process.hrtime().join('').toString()}`
    const scope = this.schema.scope
    const data = { key, value, exp, scope, id }

    this.api.emit('cache', data)
    cubic.log.verbose('Core      | Sending data to cache for ' + key)
    return new Promise(resolve => this.api.on(id, resolve))
  }
}

module.exports = Endpoint
