const jwt = require('jsonwebtoken')

/**
 * Collection of functions required for multiple endpoints.
 */
module.exports = {
  /**
   * Signs new Access Token
   */
  getAccessToken (data) {
    let key = cubic.config.auth.certPrivate
    let passphrase = cubic.config.auth.certPass
    let options = {
      expiresIn: cubic.config.auth.exp,
      algorithm: cubic.config.auth.alg,
      issuer: cubic.config.auth.iss
    }
    return jwt.sign(data, passphrase ? { key, passphrase } : key, options)
  },

  /**
   * Logs most recent IPs for users
   */
  async saveIP (user_key, ip, grant_type, success) {
    // Get length of existing logs
    let user = await this.db.collection('users').findOne({
      user_key: user_key
    })

    if (user) {
      let arrMax = cubic.config.auth.maxLogsPerUser
      let arrNew = []
      let arrExs = user.last_ip

      // If arr max is reached: delete oldest
      if (arrExs.length >= arrMax) arrExs.splice(arrMax - 1)

      // Add Newest
      arrExs.unshift({
        ip,
        grant_type,
        success,
        accessed: new Date().toISOString()
      })
      arrNew = arrExs

      // Save new array to db
      await this.db.collection('users').updateOne({
        user_key
      }, {
        $set: {
          last_ip: arrNew
        }
      }, {
        upsert: true
      })
    }
  }
}
