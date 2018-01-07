const mongodb = require('mongodb').MongoClient
const bcrypt = require('bcryptjs')
const mongoVerifySingleIndex = async (db, col, index) => {
  db.db(blitz.config.auth.core.mongoDb).collection(col).createIndex(index)
}

/**
 * Pre-Auth Class used for establishing connections to auth core node
 * Note: the middleware function must be complete, meaning no references to
 * any values outside of its own scope. We'll run that function on a whole
 * different process.
 */
class PreAuth {
  /**
   * Set mongo indices to optimize queries for user_key and refresh tokens
   */
  async verifyUserIndices () {
    let db = await mongodb.connect(blitz.config.auth.core.mongoUrl)
    blitz.log.verbose('Auth      | verifying user indices')
    mongoVerifySingleIndex(db, 'users', { refresh_token: 1 })
    mongoVerifySingleIndex(db, 'users', { user_key: 1 })
  }

  /**
   * Set up manual endpoint for auth worker to authenticate against
   */
  validateWorker () {
    blitz.nodes.auth_api.post('/authenticate', async(req, res, next) => {
      // Load dependencies inside function because it's used in another process
      const jwt = require('jsonwebtoken')
      const bcrypt = require('bcrypt-as-promised')
      const randtoken = require('rand-token')
      const mongodb = require('mongodb').MongoClient
      const db = await mongodb.connect(blitz.config.auth.core.mongoUrl)

      // Core-node attempts to connect
      if (req.body && req.body.user_key) {
        let user = await db.db(blitz.config.auth.core.mongoDb).collection('users').findOne({
          user_key: req.body.user_key
        })

        // Check if secret matches
        if (user && user.scope.includes('root')) {
          try {
            await bcrypt.compare(req.body.user_secret, user.user_secret)
          } catch(err) {
            return next()
          }
          let key = blitz.config.auth.certPrivate
          let passphrase = blitz.config.auth.certPass
          let refresh_token = user.refresh_token
          let access_token = jwt.sign({
            scp: user.scope,
            uid: user.user_id
          }, passphrase ? { key, passphrase } : key, {
            algorithm: blitz.config.auth.alg
          })

          // Send back tokens
          return res.json({
            access_token: access_token,
            refresh_token: refresh_token
          })
        }

        // Password not matching
        else {
          return next()
        }
      }

      // Normal Authentication attempt
      else {
        return next()
      }
    })
  }
}

module.exports = new PreAuth()
