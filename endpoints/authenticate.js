const Endpoint = require(cubic.config.auth.core.endpointParent)
const auth = require('../lib/auth.js')
const crypto = require('crypto')
const randtoken = require('rand-token').generator({ source: crypto.randomBytes })
const bcrypt = require('bcryptjs')
const Cookies = require('cookies')

/**
 * Contains multi-purpose functions for child-methods and provides default values
 */
class Authentication extends Endpoint {
  constructor (api, db, url) {
    super(api, db, url)
    this.schema.method = 'POST'
  }

  async main (req, res) {
    let credentials = req.body
    this.res = res

    // Credentials sent
    if (credentials.user_key) {
      let token = await this.matchCredentials(credentials, req)
      if (token) {
        if (credentials.cookie_set && cubic.config.ui.api.authCookie) {
          const cookies = new Cookies(req, res)

          // checks if session length or longliving
          const cookieConfig = {}
          if (credentials.cookie_longliving) {
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + cubic.config.ui.api.authCookieExpire)
            cookieConfig['expires'] = expiresAt
          }

          // encode token object to base64
          cookies.set(cubic.config.ui.api.authCookie, Buffer.from(JSON.stringify(token)).toString('base64'), cookieConfig)
        }

        if (credentials.redirect) {
          res.redirect(credentials.redirect)
        } else {
          res.send(token)
        }
      }
    }

    // No Allowed content
    else {
      res.status(401).send({
        error: 'Unauthorized.',
        reason: 'Expected user credentials. Got: ' + JSON.stringify(credentials)
      })
    }
  }

  /**
   * Check supplied user info & send token
   */
  async matchCredentials (credentials, req) {
    let ip = req.user.uid
    let user = await this.db.collection('users').findOne({
      user_key: credentials.user_key
    })

    try {
      await bcrypt.compare(credentials.user_secret, user.user_secret)
    } catch (err) {
      auth.saveIP.bind(this)(credentials.user_key, ip, 'authenticate', false)
      return this.res.status(403).send({
        error: 'Unauhtorized.',
        reason: 'Credentials not recognized.'
      })
    }

    // Valid User Found
    auth.saveIP.bind(this)(user.user_key, ip, 'authenticate', true)

    // Set Options
    let data = {
      scp: user.scope,
      uid: user.user_id
    }

    // Get Tokens
    let access_token = auth.getAccessToken(data)
    let refresh_token = user.refresh_token || await this.generateRefreshToken(user.user_key)

    return ({ access_token, refresh_token })
  }

  /**
   * Generate random Refresh Token & save in user doc
   */
  async generateRefreshToken (user_key) {
    const refresh_token = user_key + randtoken.generate(64)

    // Prevent same token for multiple users
    const exists = await this.db.collection('users').findOne({ refresh_token })
    if (exists) {
      return this.generateRefreshToken(user_key) // retry
    }

    // Save Refresh Token in DB
    this.db.collection('users').updateOne({
      user_key
    }, {
      $set: { refresh_token }
    }, {
      upsert: true
    })
    return refresh_token
  }
}

module.exports = Authentication
