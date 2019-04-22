const jwt = require('jsonwebtoken')
const Client = require('cubic-client')
const Cookies = require('cookies')
const Authentication = require('../../../auth/endpoints/authenticate')

class ExpressMiddleware {
  constructor (config) {
    this.config = config
    this.authClient = new Client({
      api_url: this.config.authUrl,
      auth_url: this.config.authUrl,
      user_key: this.config.user_key,
      user_secret: this.config.user_secret
    })
  }

  decode (req, res, next) {
    req.url = req.url === '' ? '/' : decodeURI(req.url)
    next()
  }

  cookie (req, res, next) {
    const cookies = new Cookies(req, res)

    let cookie = {}
    try {
      // decode base64 to object
      cookie = JSON.parse(Buffer.from(cookies.get(cubic.config.api.authCookie), 'base64').toString('ascii'))
    } catch (err) {} // No cookie set, or not base64 encoded

    const accessToken = cookie.access_token
    const refreshToken = cookie.refresh_token

    // Set access token from cookie as auth header if none was provided already.
    if (accessToken && !req.headers.authorization) {
      req.headers.authorization = `bearer ${accessToken}`
    }

    // Set refresh token in case of the access token being expired.
    if (refreshToken) req.refresh_token = refreshToken

    return next()
  }

  async authorize (req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    req.user = {
      uid: ip,
      scp: ''
    }

    // Token present?
    if (req.headers.authorization) {
      let token = req.headers.authorization.replace(/bearer /i, '')

      // Set req.user from token
      try {
        req.user = jwt.verify(token, this.config.certPublic)
      }

      // Could not verify token
      catch (err) {
        cubic.log.verbose(`${this.config.prefix} | (http) ${ip} rejected (${err})`)

        // Check if token needs to be refreshed
        if (err.name === 'TokenExpiredError' && req.refresh_token) {
          let refreshRequest = await this.authClient.post('/refresh', { refresh_token: req.refresh_token })

          if (refreshRequest.access_token) {
            token = refreshRequest.access_token
            req.headers.authorization = `bearer ${token}`
            Authentication.setAuthCookie(req, res, { access_token: token, refresh_token: req.refresh_token }, false, true)
          } else {
            return res.status(401).json(refreshRequest)
          }

        // Invalid token
        } else {
          return res.status(401).json({
            error: 'Invalid Token.',
            reason: err
          })
        }
      }

      // Set access token if everything is right
      req.access_token = token
      cubic.log.verbose(`${this.config.prefix} | (http) ${ip} connected as ${req.user.uid}`)
      return next()
    }

    // No token provided
    else {
      cubic.log.verbose(`${this.config.prefix} | (http) ${req.user.uid} connected without token`)
      return next()
    }
  }
}

module.exports = ExpressMiddleware
