/**
 * Class describing generic database/calculation methods
 * Any lower-level method extends this class
 */
class Endpoint {
  constructor (api, db, url) {
    this.schema = {
      scope: '',
      method: 'GET',
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
    cubic.log.verbose('Core      | Sending data to publish for ' + endpoint)
    this.api.connection.client.send(JSON.stringify({
      action: 'PUBLISH',
      endpoint,
      data
    }))
  }

  /**
   * Send data to be cached for endpoint on API node
   */
  cache (value, exp, headers, key = this.url) {
    const scope = this.schema.scope

    cubic.log.verbose('Core      | Sending data to cache for ' + key)
    this.api.connection.client.send(JSON.stringify({
      action: 'CACHE',
      key,
      headers,
      value,
      exp,
      scope
    }))
  }
}

module.exports = Endpoint
