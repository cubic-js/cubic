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
    if (!cubic.config.auth.skipInitialSetup && !cubic.config.auth.certPrivate) {
      await this.checkRSAKeys()
    }
    const api = await cubic.use(new API(cubic.config.auth.api))
    if (!cubic.config.auth.skipInitialSetup) await this.createSystemUser(api)
  }

  /**
   * Generate RSA keys for api token signatures.
   */
  async checkRSAKeys () {
    let prv, pub
    let prvPath = cubic.config.auth.certPrivatePath
    let pubPath = cubic.config.auth.certPublicPath
    let tmpPath = prvPath ? prvPath.split('/') : ''
    if (prvPath) tmpPath.pop()
    let certDir = tmpPath ? tmpPath.join() : `${process.cwd()}/config/certs`

    try {
      await fileExists(prvPath)
      prv = await readFile(prvPath, 'utf-8')
      pub = await readFile(pubPath, 'utf-8')
    } catch (err) {
      const keys = generateKeys()
      prv = keys.private
      pub = keys.public
      console.log(certDir)
      await mkdir(certDir, { recursive: true })
      await writeFile(pubPath, pub)
      await writeFile(prvPath, prv)
      await writeFile(`${certDir}/.gitignore`, '*')
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
