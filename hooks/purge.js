const mongodb = require('mongodb').MongoClient

/**
 * Remove unused users to reduce unnecessary storage usage (production only)
 */
class Purge {
  async purgeInactiveUsers () {
    if (cubic.config.local.environment === 'production' && cubic.config.auth.purgeMaxLimit > 0) {
      let db = await mongodb.connect(cubic.config.auth.core.mongoUrl)
      setInterval(() => {
        let limit = new Date() - cubic.config.auth.purgeMaxLimit
        db.db(cubic.config.auth.core.mongoDb).collection('users').remove({
          'last_ip.0.accessed': {
            $lt: limit
          }
        })
      }, cubic.config[cubic.id].purgeInterval)
    }
  }
}

module.exports = new Purge()
