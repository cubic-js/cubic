const Endpoint = require('cubic-api/endpoint')

/**
 * This is a regular cubic-core endpoint to respond to a request on the view
 * server. There's a default endpoint for every site in your /sites folder that
 * is used implicitly if we don't specify another one here, since they all
 * do the same anyway.
 *
 * You'll want to use explicit endpoints like this if you need to make use of
 * cubic-core features like caching, different rate limits, or maybe you even
 * need access to the original request object.
 *
 * For this example, we'll simply show you how redirects would work.
 * This endpoint will redirect from `/redirect` to `/`
 */
class Redirect extends Endpoint {
  main (req, res) {
    res.redirect('/')
  }
}

module.exports = Redirect
