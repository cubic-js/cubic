const Endpoint = require(blitz.config[blitz.id].endpointParent)

/**
 * JSON Web Tokens modules to generate tokens
 */
const jwt = require('jsonwebtoken')
const randtoken = require('rand-token')

/**
 * Secret Secrecy
 */
const bcrypt = require('bcrypt-as-promised')

/**
 * Contains multi-purpose functions for child-methods and provides default values
 */
class Authentication extends Endpoint {
  constructor (api, db, req) {
    super(api, db, req)
    this.schema.method = 'POST'
  }

  async main (auth) {
    // Credentials sent
    if (auth.user_key) {
      return this.matchCredentials(auth, this.req)
    }

    // Refresh Token sent
    else if (auth.refresh_token) {
      return this.matchRefreshToken(auth, this.req)
    }

    // No Allowed content
    else {
      throw ({
        error: 'Unauthorized.',
        reason: 'Expected user credentials or refresh token. Got: ' + JSON.stringify(auth)
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

    // No User Found
    if (await this.isValidSecret(credentials.user_secret, user.user_secret)) {
      // Valid User Found
      this.saveIP(user.user_key, ip, 'credentials', true)

      // Set Options
      let data = {
        scp: this.getFullScope(user.scope),
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
    // Password mismatch or user not found
    else {
      return this.unauthorized(credentials.user_key, ip, 'credentials')
    }
  }

  /**
   * Validates Refresh token, sends new access token
   */
  async matchRefreshToken (credentials, req) {
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
        scp: this.getFullScope(user.scope),
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
  async saveIP (user_key, ip, grant_type, authorized) {
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
  getAccessToken (data) {
    let options = {
      expiresIn: blitz.config.auth.exp,
      algorithm: blitz.config.auth.alg,
      issuer: blitz.config.auth.iss
    }
    return jwt.sign(data, blitz.config.auth.certPrivate, options)
  }

  /**
   * Generate random Refresh Token & save in user doc
   */
  generateRefreshToken (user_key) {
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
  async isValidSecret (secret, localhash) {
    return bcrypt.compare(secret, localhash)
  }

  /**
   * Extend given minimum scope with any higher
   */
  getFullScope (scope) {
    let scopes = blitz.config.auth.scopes
    let scopeSplit = scope.split(' ')
    for (var i = 0; i < scopes.length; i++) {
      scopeSplit.forEach((subscope) => {
        if (scopes[i] === subscope) {
          scope += ' ' + scopes.slice(0, i).join(' ')
        }
      })
    }
    return scope
  }

  /**
   * Sends error to web client
   */
  unauthorized (user_key, ip, grant_type) {
    // Log IP if provided
    if (user_key && ip) this.saveIP(user_key, ip, grant_type, false)
    throw ({
      error: 'Unauhtorized.',
      reason: 'Credentials not recognized.'
    })
  }
}

module.exports = Authentication
