const Endpoint = require(blitz.config.auth.core.endpointParent)
const auth = require('../lib/auth.js')
const crypto = require('crypto')
const randtoken = require('rand-token').generator({ source: crypto.randomBytes })
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
    if (credentials.user_id && credentials.user_secret) {
      let user_key = await this.newUser(credentials, req)
      if (user_key) res.send({ user_key })
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
    let ip = req.user.uid
    let user_id = credentials.user_id
    let user_secret = credentials.user_secret

    if (!user_id.trim() || !user_secret.trim()) {
      this.res.status(400).send({
        error: 'Registration failed.',
        reason: 'User key or secret is empty.'
      })
      return
    }

    let userExists = await this.db.collection('users').findOne({ user_id })
    if (userExists) {
      this.res.status(409).send({
        error: 'Registration failed.',
        reason: 'User key is already taken.'
      })
      return
    }

    let user = {
      user_id,
      user_key: `${user_id}-${randtoken.generate(32)}`,
      user_secret: await bcrypt.hash(user_secret, 8),
      scope: '',
      refresh_token: null,
      last_ip: []
    }
    this.db.collection('users').insertOne(user)
    auth.saveIP.bind(this)(user.user_key, ip, 'register', true)

    return user.user_key
  }
}

module.exports = Authentication
