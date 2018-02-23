const Endpoint = require(blitz.config.auth.core.endpointParent)

/**
 * JSON Web Tokens modules to generate tokens
 */
const jwt = require('jsonwebtoken')

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
      this.unauthorized()
    }

    // Valid User Found > Send token
    else {
      let data = {
        scp: user.scope,
        uid: user.user_id
      }

      // Get Tokens
      let access_token = this.getAccessToken(data)

      // Save IP
      this.saveIP(user.user_key, ip, 'refresh token', true)
      return ({
        access_token: access_token
      })
    }
  }

  /**
   * Logs most recent IPs for users
   */
  async saveIP(user_key, ip, grant_type, authorized) {
    // Get length of existing logs
    let user = await this.db.collection('users').findOne({
      user_key: user_key
    })

    if (user) {
      let arr_max = blitz.config.auth.maxLogsPerUser
      let arr_new = []
      let arr_exs = user.last_ip

      // If arr max is reached: delete oldest
      if (arr_exs.length >= arr_max) arr_exs.splice(arr_max - 1)

      // Add Newest
      arr_exs.unshift({
        ip: ip,
        grant_type: grant_type,
        success: authorized,
        accessed: new Date().toISOString()
      })
      arr_new = arr_exs

      // Save new array to db
      await this.db.collection('users').updateOne({
        'user_key': user_key
      }, {
        $set: {
          'last_ip': arr_new
        }
      }, {
        upsert: true
      })
    }
  }

  /**
   * Signs new Access Token
   */
  getAccessToken(data) {
    let key = blitz.config.auth.certPrivate
    let passphrase = blitz.config.auth.certPass
    let options = {
      expiresIn: blitz.config.auth.exp,
      algorithm: blitz.config.auth.alg,
      issuer: blitz.config.auth.iss
    }

    return jwt.sign(data, passphrase ? { key, passphrase } : key, options)
  }

  /**
   * Sends error to web client and logs IP if provided
   */
  unauthorized(user_key, ip, grant_type) {
    if (user_key && ip) this.saveIP(user_key, ip, grant_type, false)
    this.res.status(403).send({
      error: 'Unauhtorized.',
      reason: 'Credentials not recognized.'
    })
  }
}

module.exports = Refresh
