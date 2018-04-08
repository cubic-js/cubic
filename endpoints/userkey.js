const Endpoint = require(cubic.config.auth.core.endpointParent)
const auth = require('../lib/auth.js')
const crypto = require('crypto')
const randtoken = require('rand-token').generator({ source: crypto.randomBytes })
const bcrypt = require('bcryptjs')

/**
 * Get the User Key for a given user. Important when authenticating through the
 * API after the user_key from /register has been discarded
 */
class UserKey extends Endpoint {
  constructor(api, db, url) {
    super(api, db, url)
    this.schema.method = 'POST'
  }

  async main(req, res) {
    const user_id = req.body.user_id
    const user_secret = req.body.user_secret
    this.getUserKey(user_id, user_secret, req, res)
  }

  /**
   * Find the user key (Assumes the user is verified). The user_key isn't really
   * that sensitive, but not public either, so we'd rather keep it safe.
   */
  async getUserKey(user_id, user_secret, req, res) {
    const ip = req.user.uid
    const user = await this.db.collection('users').findOne({ user_id })

    try {
      await bcrypt.compare(user_secret, user.user_secret)
    } catch (err) {
      auth.saveIP.bind(this)(credentials.user_key, ip, 'credentials', false)
      res.status(403).send({
        error: 'Unauhtorized.',
        reason: 'Credentials not recognized.'
      })
      return
    }

    // Verified
    auth.saveIP.bind(this)(user.user_key, ip, 'getUserKey', true)
    res.send({ user_key: user.user_key })
  }
}

module.exports = UserKey
