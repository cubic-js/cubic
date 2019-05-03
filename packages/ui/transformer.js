const send = require('@polka/send-type')

class UITransformer {
  // Not actually middleware, applies the middleware correctly into the stack
  async apply (ui) {
    // Polka instance
    const httpApp = ui.server.http.app

    // Applies convert res middleware and put's it at second place on the stack (after the original api convert res)
    await httpApp.use(this.convertResUI)
    httpApp.wares.splice(1, 0, httpApp.wares.splice(httpApp.wares.length - 1, 1)[0])
  }

  // Middleware to convert api res object
  convertResUI (req, res, next) {
    res.send = res.json = (data, headers) => {
      // If error return new render of error page
      if (res.statusCode >= 400 && cubic.config.ui.api.errorUrl) {
        req.url = cubic.config.ui.api.errorUrl
        req.errorData = data
        req.errorData.code = res.statusCode

        const http = cubic.nodes.ui.api.server.http.endpoints
        if (http.dev) http.deleteRequireCache('cubic-ui/endpoint')
        const Endpoint = require('cubic-ui/endpoint')
        const component = new Endpoint({ url: cubic.config.ui.api.errorUrl, cache: http.cache, ws: http.ws, db: http.db })

        headers ? headers['content-type'] = 'text/html' : headers = { 'content-type': 'text/html' }
        component.render(req).then((html) => { send(res, res.statusCode, html, headers) })

      // Otherwise send normally
      } else {
        send(res, res.statusCode, data, headers)
      }

      return res
    }

    return next()
  }
}

module.exports = UITransformer
