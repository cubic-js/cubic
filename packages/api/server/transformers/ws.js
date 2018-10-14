const Url = require('url')

class WsTransformer {
  convertReq (request, spark, method) {
    const req = {}
    const url = request.url
    const parsed = Url.parse(`https://cubic${url}`, true) // domain is irrelevant
    req.body = request.body
    req.url = url === '' ? '/' : decodeURI(url)
    req.user = spark.request.user
    req.method = method
    req.query = parsed.query
    req.params = {} // will get populated on cubic-core
    req.adapter = 'ws'

    return req
  }

  convertRes (spark, request) {
    const { id } = request
    if (!id) return

    const res = {
      statusCode: 200,
      body: ''
    }

    const ack = (data) => {
      spark.write({ action: 'RES', ...res, id })
    }

    res.send = res.json = data => {
      res.body = data
      ack(res)
    }

    res.status = code => {
      res.statusCode = code
      return res
    }

    res.redirect = (status, location) => {
      status = typeof status === 'number' ? status : 302
      location = typeof status === 'number' ? location : status
      return res.status(status).send(location)
    }
    res.header = () => res

    return res
  }
}

module.exports = WsTransformer
