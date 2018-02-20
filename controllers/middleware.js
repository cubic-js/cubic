class MiddlewareController {
  constructor(config) {
    this.stack = config ? config.middleware || [] : []
  }

  /**
   * Add new middleware functions to the stack.
   */
  use(route, fn, verb) {
    this.stack.unshift({
      method: verb || '*',
      route: typeof route === 'string' ? route : '*',
      fn: typeof fn === 'function' ? fn : route
    })
  }

  /**
   * Run given req, res objects through each middleware function
   */
  async run(req, res, endpoint) {
    for (let mw of this.stack) {
      if (this.matches(mw, req, res)) {
        await mw.fn(req, res, endpoint)
      }
    }
  }

  /**
   * Check if route matches and assign optional placeholders
   */
  matches(mw, req, res) {
    // Normalize url/route format
    mw.route = mw.route[mw.route.length - 1] === '/' ? mw.route.slice(0, -1) : mw.route
    req.url = req.url[req.url.length - 1] === '/' ? req.url.slice(0, -1) : req.url

    // https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript
    if (new RegExp('^' + mw.route.split('*').join('.*') + '$').test(req.url)
                   && (req.method === mw.method || mw.method === '*')) {
      return true
    }

    // Not matching
    return false
  }
}

module.exports = MiddlewareController