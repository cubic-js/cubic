const Endpoint = require(blitz.config[blitz.id].endpointParent)

/**
 * JSON Web Tokens modules to generate tokens
 */
const jwt = require('jsonwebtoken')
const randtoken = require('rand-token')

/**
 * Secret Secrecy
 */
const bcrypt = require('bcryptjs')

/**
 * Contains multi-purpose functions for child-methods and provides default values
 */
class Authentication extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.method = 'POST'
  }

  async main(req, res) {
    let credentials = req.body
    this.res = res

    // Credentials sent
    if (credentials.user_key) {
      let token = await this.matchCredentials(credentials, req)
      if (token) res.send(token)
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
  async matchCredentials(credentials, req) {
    let ip = req.user.uid
    let user = await this.db.collection('users').findOne({
      user_key: credentials.user_key
    })

    try {
      await this.isValidSecret(credentials.user_secret, user.user_secret)
    } catch (err) {
      return this.unauthorized(credentials.user_key, ip, 'credentials')
    }

    // Valid User Found
    this.saveIP(user.user_key, ip, 'credentials', true)

    // Set Options
    let data = {
      scp: user.scope,
      uid: user.user_id
    }

    // Get Tokens
    let accessToken = this.getAccessToken(data)
    let refreshToken = user.refresh_token ? user.refresh_token : this.generateRefreshToken(user.user_key)

    return ({
      access_token: accessToken,
      refresh_token: refreshToken
    })
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
   * Generate random Refresh Token & save in user doc
   */
  generateRefreshToken(user_key) {
    // Generate Unique Token for Refresh
    let refreshToken = user_key + randtoken.uid(256)

    // Save Refresh Token in DB
    this.db.collection('users').updateOne({
      'user_key': user_key
    }, {
      $set: {
        'refresh_token': refreshToken
      }
    }, {
      upsert: true
    })
    return refreshToken
  }

  /**
   * Compares Bcrypt hash w/ supplied secret
   */
  async isValidSecret(secret, localhash) {
    return bcrypt.compare(secret, localhash)
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

module.exports = Authentication
