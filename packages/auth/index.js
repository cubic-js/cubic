const API = require('cubic-api')
const local = require('./config/local.js')
const fs = require('fs')
const promisify = require('util').promisify
const mkdir = promisify(fs.mkdir)
const fileExists = promisify(fs.lstat)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const generateKeys = require('keypair')
const mongodb = require('mongodb')
const bcrypt = require('bcryptjs')
const randtoken = require('rand-token')

class Auth {
  constructor (options) {
    this.config = {
      local: local,
      provided: options || {}
    }
  }

  async init () {
    if (!this.config.skipInitialSetup && !cubic.config.auth.certPrivate) {
      await this.checkRSAKeys()
    }
    const api = await cubic.use(new API(cubic.config.auth.api))
    if (!this.config.skipInitialSetup) await this.createSystemUser(api)
  }

  /**
   * Generate RSA keys for api token signatures.
   */
  async checkRSAKeys () {
    let prv, pub
    try {
      await fileExists(`${cubic.config.auth.certDir}/auth.private.pem`)
      prv = await readFile(`${cubic.config.auth.certDir}/auth.private.pem`, 'utf-8')
      pub = await readFile(`${cubic.config.auth.certDir}/auth.public.pem`, 'utf-8')
    } catch (err) {
      // Ensure /config/certs folder exists
      try { await mkdir(`${process.cwd()}/config/`) } catch (err) {}
      try { await mkdir(cubic.config.auth.certDir) } catch (err) {}

      // Generate keys and save to /config/certs
      const keys = generateKeys()
      prv = keys.private
      pub = keys.public
      await writeFile(`${cubic.config.auth.certDir}/auth.public.pem`, pub)
      await writeFile(`${cubic.config.auth.certDir}/auth.private.pem`, prv)
      await writeFile(`${cubic.config.auth.certDir}/.gitignore`, '*')
    }
    cubic.config.auth.api.certPublic = pub
    cubic.config.auth.certPrivate = prv
  }

  /**
   * Generates API user without rate limits for use within cubic. This is
   * particularily important for cubic-ui
   */
  async createSystemUser (api) {
    const mongo = await mongodb.connect(cubic.config.auth.api.mongoUrl, { useNewUrlParser: true })
    const db = mongo.db(cubic.config.auth.api.mongoDb)
    const key = randtoken.uid(32)
    const secret = randtoken.uid(32)
    api.systemUser = {
      user_id: key,
      user_secret: secret
    }
    await db.collection('users').updateOne({
      user_key: key
    }, {
      $set: {
        user_id: 'cubic',
        user_key: key,
        user_secret: await bcrypt.hash(secret, 8),
        last_ip: [],
        scope: 'ignore_rate_limit'
      }
    }, {
      upsert: true
    })
  }
}

module.exports = Auth
