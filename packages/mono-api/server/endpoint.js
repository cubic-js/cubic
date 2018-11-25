/**
 * Class describing API endpoint. This will be extended in every custom API
 * endpoint.
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

  async publish (data, endpoint = this.url) {
    cubic.log.verbose('Core      | Sending data to publish for ' + endpoint)
    await this.api.connecting()
    this.api.connection.client.send(JSON.stringify({
      action: 'PUBLISH',
      endpoint,
      data
    }))
  }

  async cache (value, exp, headers, key = this.url) {
    const scope = this.schema.scope

    cubic.log.verbose('Core      | Sending data to cache for ' + key)
    await this.api.connecting()
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
