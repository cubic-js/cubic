const Endpoint = require(cubic.config.auth.core.endpointParent)
const auth = require('../lib/auth.js')

/**
 * Contains multi-purpose functions for child-methods and provides default values
 */
class Refresh extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.method = 'POST'
  }

  async main(req, res) {
    let credentials = req.body
    this.res = res

    // Refresh Token sent
    if (credentials.refresh_token) {
      let token = await this.matchRefreshToken(credentials, req)
      if (token) res.send(token)
    }

    // No Allowed content
    else {
      res.status(401).send({
        error: 'Unauthorized.',
        reason: 'Expected refresh token. Got: ' + JSON.stringify(credentials)
      })
    }
  }

  /**
   * Validates Refresh token, sends new access token
   */
  async matchRefreshToken(credentials, req) {
    let ip = req.user.uid
    let user = await this.db.collection('users').findOne({
      refresh_token: credentials.refresh_token
    })

    // No Refresh Token found
    if (!user) {
      this.res.status(403).send({
        error: 'Unauhtorized.',
        reason: 'Credentials not recognized.'
      })
    }

    // Valid User Found > Send token
    else {
      let data = {
        scp: user.scope,
        uid: user.user_id
      }

      // Get Tokens
      let access_token = auth.getAccessToken(data)

      // Save IP
      auth.saveIP.bind(this)(user.user_key, ip, 'refresh', true)
      return ({ access_token })
    }
  }
}

module.exports = Refresh
