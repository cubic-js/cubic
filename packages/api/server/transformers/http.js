const send = require('@polka/send-type')
const Url = require('url')

class HttpTransformer {
  convertReq (request) {
    const req = {}
    const url = request.url
    const parsed = Url.parse(`https://cubic${url}`, true) // domain is irrelevant
    req.body = request.body
    req.url = url === '' ? '/' : decodeURI(url)
    req.url = req.url.replace(/\.?\.\//gi, '') // Remove relative paths (../, ./)
    req.user = request.user
    req.method = request.method
    req.headers = request.headers
    req.access_token = request.access_token
    req.refresh_token = request.refresh_token
    req.query = parsed.query
    req.params = {} // will get populated on cubic-core
    req.adapter = 'http'

    return req
  }

  convertRes (req, res, next) {
    // The 'headers' var isn't actually callable.
    // It instead contains the current headers and gets set by ../adapters/adapter.js:getResponse()
    res.send = res.json = (data, headers) => {
      send(res, res.statusCode, data, headers)
      return res
    }

    res.redirect = (location, headers) => {
      res.writeHead(res.statusCode > 300 ? res.statusCode : 302, {
        Location: location,
        ...res.headers,
        ...headers
      })
      res.end()
      return res
    }

    res.status = code => {
      res.statusCode = code
      return res
    }

    return next()
  }
}

module.exports = HttpTransformer
