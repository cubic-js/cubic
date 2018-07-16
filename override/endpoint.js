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
    return res.send(this.render(req))
  }

  /**
   * Publish Data for a specific endpoint
   */
  async publish (data, endpoint = this.url) {
    const update = { endpoint, data }

    cubic.log.verbose('Core      | Sending data to publish for ' + endpoint)
    return new Promise(resolve => this.api.connection.client.emit('publish', update, resolve))
  }

  /**
   * Send data to be cached for endpoint on API node
   */
  async cache (value, exp, key = this.url) {
    const scope = this.schema.scope
    const data = { key, value, exp, scope }

    cubic.log.verbose('Core      | Sending data to cache for ' + key)
    return new Promise(resolve => this.api.connection.client.emit('cache', data, resolve))
  }

  /**
   * Render page with Vue.js
   */
  async render (req) {
    const html = await view.render(req)
    this.cache(html, cubic.config.ui.api.cacheExp)
    return html
  }
}

module.exports = Endpoint
