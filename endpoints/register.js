const Endpoint = require(blitz.config.auth.core.endpointParent)

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

  async main (req, res) {
    let credentials = req.body
    this.res = res

    // Credentials sent
    if (credentials.user_key && credentials.user_secret) {
      let user_id = await this.newUser(credentials, req)
      if (user_id) res.send(user_id)
    }

    // No allowed content
    else {
      res.status(401).send({
        error: 'Unauthorized.',
        reason: 'Expected user credentials. Got: ' + JSON.stringify(credentials)
      })
    }
  }

  /**
   * Generate new User into db and return credentials to use
   */
  async newUser (credentials, req) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    let user_key = credentials.user_key
    let user_secret = credentials.user_secret

    if (!user_key.trim() || !user_secret.trim()) {
      this.res.status(403).send({
        error: 'Registration failed.',
        reason: 'User key or secret is empty.'
      })
      return
    }

    let userExists = await this.db.collection('users').findOne({ user_key: user_key })
    if (userExists) {
      this.res.status(403).send({
        error: 'Registration failed.',
        reason: 'User key is already taken.'
      })
      return
    }

    let user = {
      user_id: 'unidentified-' + randtoken.uid(16),
      user_key: user_key,
      user_secret: await bcrypt.hash(user_secret, 8),
      scope: 'basic-read',
      refresh_token: null,
      last_ip: []
    }

    this.db.collection('users').insertOne(user)
    await this.saveIP(user_key, ip, 'register', true)
    return ({
      user_id: user.user_id
    })
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
}

module.exports = Authentication
