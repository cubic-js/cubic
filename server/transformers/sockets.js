const Url = require('url')

class SocketTransformer {
  convertReq (request, socket, verb) {
    if (request) {
      let req = {}
      let url = verb === 'GET' ? request : request.url
      let parsed = Url.parse(`https://cubic${url}`, true) // domain is irrelevant

      req.body = request.body
      req.url = url === '' ? '/' : decodeURI(url)
      req.user = socket.user
      req.method = verb
      req.query = parsed.query
      req.params = {} // will get populated on cubic-core
      req.adapter = 'socket.io'

      return req
    } else {
      return {}
    }
  }

  convertRes (ack) {
    const res = {
      statusCode: 200,
      body: ''
    }

    res.send = data => {
      if (ack) {
        res.body = data
        ack(res)
      }
    }

    res.status = code => {
      res.statusCode = code
      return res
    }

    res.sendFile = res.send
    res.json = res.send
    res.end = res.send

    res.redirect = (status, location) => {
      status = typeof status === 'number' ? status : 302
      location = typeof status === 'number' ? location : status
      return res.status(status).send(location)
    }
    res.header = () => res

    return res
  }
}

module.exports = SocketTransformer
