const view = require('../controllers/view.js')

/**
 * Class describing generic database/calculation methods
 * Any lower-level method extends this class
 */
class Endpoint {
  constructor (api, db, url) {
    this.schema = {
      scope: '',
      method: 'GET',
      query: [],
      view: '/app.vue'
    }
    this.api = api
    this.db = db
    this.url = url
  }

  /**
   * Just render the given view if no other instructions are given.
   */
  async main (req, res) {
    res.res.headers = {
      'content-type': 'text/html'
    }
    return res.send(this.render(req))
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

  /**
   * Render page with Vue.js
   */
  async render (req) {
    const html = await view.render(req)
    this.cache(html, cubic.config.ui.api.cacheExp, { 'content-type': 'text/html' })
    return html
  }
}

module.exports = Endpoint
