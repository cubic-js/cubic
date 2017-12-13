const mongodb = require('mongodb').MongoClient

/**
 * Remove unused users to reduce unnecessary storage usage (production only)
 */
class Purge {
  async purgeInactiveUsers () {
    if (blitz.config.local.environment === 'production' && blitz.config.auth.purgeMaxLimit > 0) {
      let db = await mongodb.connect(blitz.config.auth.core.mongoUrl)
      setInterval(() => {
        let limit = new Date() - blitz.config.auth.purgeMaxLimit
        db.collection('users').remove({
          'last_ip.0.accessed': {
            $lt: limit
          }
        })
      }, blitz.config[blitz.id].purgeInterval)
    }
  }
}

module.exports = new Purge()
