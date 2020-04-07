class Url {
  /**
   * Parse URL to assign placeholder data
   */
  parse (req, res, endpoint) {
    this.parseParams(req, endpoint)
    this.parseQuery(req, endpoint)
  }

  /**
   * Put placeholders from url into req.params
   * E.g. /users/:id/tasks -> req.params.id holds the data in place of :id
   */
  parseParams (req, endpoint) {
    let eUrl = endpoint.route.split('/')
    let reqUrl = req.url.split('/')
    let difference = eUrl.length - reqUrl.length

    let i = 0
    for (const fragment of eUrl) {
      if (fragment.includes(':') && fragment.includes('?') && difference > 0) difference--
      else {
        if (fragment.includes(':')) req.params[fragment.replace(':', '').replace('?', '')] = decodeURIComponent(reqUrl[i])
        i++
      }
    }
  }

  /**
   * Put query params into req.query
   * E.g. /someroute?test=Kappa123 -> req.query.test = Kappa123
   */
  parseQuery (req, endpoint) {
    /* eslint no-useless-escape: "off" */
    let regex = /(\?)([^=]+)\=([^&]+)/
    let url = req.url
    let matching = regex.exec(url)

    while (matching) {
      let key = matching[2]
      for (let i = 0; i < endpoint.query.length; i++) {
        if (key === endpoint.query[i].name) {
          req.query[key] = decodeURIComponent(matching[3])
        }
      }
      url = url.replace(matching[0], '').replace('&', '?')
      matching = regex.exec(url)
    }

    this.parseQueryTypes(req, endpoint)
  }

  /**
   * Convert string params from URL to target type
   */
  parseQueryTypes (req, endpoint) {
    endpoint.query.forEach(query => {
      let def = typeof query.default === 'function' ? query.default() : query.default
      let key = query.name

      // Convert value to target type
      if (req.query[key]) {
        if (typeof def === 'number') {
          req.query[key] = parseFloat(req.query[key])
        }
        if (typeof def === 'boolean') {
          /* eslint eqeqeq: "off" */
          req.query[key] = req.query[key] == 'true' || req.query[key] == '1'
        }
        if (typeof def === 'object') {
          req.query[key] = JSON.stringify(req.query[key])
        }
      }

      // No value given, use default
      else {
        req.query[key] = def
      }
    })
  }
}

module.exports = new Url()
