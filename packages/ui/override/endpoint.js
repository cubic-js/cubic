const view = require('../controllers/view.js')
const Endpoint = require('cubic-mono-api/server/endpoint')

/**
 * Overrides original endpoint. This one only adds the view key to the schema
 * and renders it in the main function by default, since that's what all normal
 * pages do.
 */
class View extends Endpoint {
  /**
   * Just render the given view if no other instructions are given.
   */
  async main (req, res) {
    res.setHeader('content-type', 'text/html')
    return res.send(await this.render(req))
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

module.exports = View
