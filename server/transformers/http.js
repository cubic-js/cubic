const send = require('@polka/send-type')
const Url = require('url')

class HttpTransformer {
  convertReq (request) {
    const req = {}
    const url = request.url
    const parsed = Url.parse(`https://cubic${url}`, true) // domain is irrelevant
    req.body = request.body
    req.url = url === '' ? '/' : decodeURI(url)
    req.user = request.user
    req.method = request.method
    req.query = parsed.query
    req.params = {} // will get populated on cubic-core
    req.adapter = 'http'

    return req
  }

  convertRes (res) {
    res.send = res.json = (data, headers) => {
      send(res, res.statusCode, data, headers)
    }

    res.redirect = location => {
      res.writeHead(res.statusCode, {
        Location: location
      })
      res.end()
    }

    res.status = code => {
      res.statusCode = code
      return res
    }
  }
}

module.exports = HttpTransformer
