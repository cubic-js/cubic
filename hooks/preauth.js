const mongodb = require('mongodb').MongoClient
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const randtoken = require('rand-token')

class PreAuth {
  /**
   * Set mongo indices to optimize queries for user_key and refresh tokens
   */
  async verifyUserIndices () {
    const client = await mongodb.connect(cubic.config.auth.core.mongoUrl)
    const db = client.db(cubic.config.auth.core.mongoDb)
    const mongoVerifySingleIndex = async (db, col, index) => {
      db.collection(col).createIndex(index)
    }

    mongoVerifySingleIndex(db, 'users', { refresh_token: 1 })
    mongoVerifySingleIndex(db, 'users', { user_key: 1 })
    client.close()
  }

  /**
   * Set up manual endpoint for auth worker to authenticate against. This solves
   * the chicken-egg problem of letting the auth worker authenticate itself.
   */
  validateWorker () {
    cubic.nodes.auth.api.use('/authenticate', async(req, res) => {
      // Core-node attempts to connect
      if (req.body && req.body.user_key) {
        const client = await mongodb.connect(cubic.config.auth.core.mongoUrl)
        const db = client.db(cubic.config.auth.core.mongoDb)
        const user = await db.collection('users').findOne({
          user_key: req.body.user_key
        })

        // Check if secret matches
        if (user && user.scope.includes('write_auth')) {
          try {
            await bcrypt.compare(req.body.user_secret, user.user_secret)
          } catch(err) {
            client.close()
            throw 'Invalid password.'
          }
          let key = cubic.config.auth.certPrivate
          let passphrase = cubic.config.auth.certPass
          let refresh_token = user.refresh_token
          let access_token = jwt.sign({
            scp: user.scope,
            uid: user.user_id
          }, passphrase ? { key, passphrase } : key, {
            algorithm: cubic.config.auth.alg
          })

          // Cleanup
          client.close()
          this.removeMiddleware(cubic.nodes.auth.api.server.http.stack.stack, '/authenticate')
          this.removeMiddleware(cubic.nodes.auth.api.server.sockets.stack.stack, '/authenticate')

          // Send back tokens
          res.json({
            access_token: access_token,
            refresh_token: refresh_token
          })
        }
        client.close()
      }
    }, 'POST')
  }

  /**
   * Remove middleware again after auth worker has been verified
   */
  removeMiddleware(stack, route) {
    const index = stack.findIndex(mw => mw.route === route)
    stack.splice(index, 1)
  }
}

module.exports = new PreAuth()
