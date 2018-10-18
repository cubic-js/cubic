/**
 * Automatic authentication setup for each loaded node. In short, this generates
 * unique RSA-and root user keys for each node. You wouldn't wanna do this
 * manually.
 * -
 * Generates RSA keys if none are available in the working directory, then
 * passes those keys to the relevant API node.
 * -
 * Generates a new user with `write_root` permissions for each type of core
 * node that has been loaded.
 * -
 * RSA keys are used for signing authorization tokens.
 * The keys can still be changed manually by putting them
 * in `${process.cwd()}/config/certs/auth.public|private.pem`
 */
const prod = process.env.NODE_ENV === 'production'
const fs = require('fs')
const promisify = require('util').promisify
const fileExists = promisify(fs.lstat)
const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const generateKeys = require('keypair')
const mongodb = require('mongodb').MongoClient
const bcrypt = require('bcryptjs')
const randtoken = require('rand-token')
const certDir = `${process.cwd()}/config/certs`
const _ = require('lodash')

/**
 * Auth class managing keys and node credentials on load
 */
class Auth {
  constructor () {
    this.authUrl = new Promise(resolve => { this.resolveUrl = resolve })
    this.certsReady = false
  }

  /**
   * See if RSA keys available in file system, if not: generate and save
   */
  async checkRSAKeys (resolve) {
    try {
      if (this.certsReady) {
        return resolve()
      }
      await fileExists(`${certDir}/auth.private.pem`)
      this.certPrivate = await readFile(`${certDir}/auth.private.pem`, 'utf-8')
      this.certPublic = await readFile(`${certDir}/auth.public.pem`, 'utf-8')
      this.certsReady = true
    } catch (err) {
      const keys = generateKeys()
      this.certPrivate = keys.private
      this.certPublic = keys.public

      // Save keys so we can use them next time
      try {
        await mkdir(`${process.cwd()}/config/`)
      } catch (err) {}
      try {
        await mkdir(certDir)
      } catch (err) {}
      await writeFile(`${certDir}/auth.public.pem`, this.certPublic)
      await writeFile(`${certDir}/auth.private.pem`, this.certPrivate)
      await writeFile(`${certDir}/.gitignore`, '*')
      this.certsReady = true
    }
    resolve()
  }

  /**
   * Verify that RSA keys are set in configs and validate/generate users
   */
  async verify (id, config) {
    // Don't mutate original config, return a modified clone instead.
    // We encountered some weird race conditions where the config reference
    // would be swapped (even though JS shouldn't actually allow that)
    config = _.cloneDeep(config)

    // Wait for RSA keys to become available and assign
    await new Promise(resolve => this.checkRSAKeys(resolve))
    this.assignKeys(id, config)

    // Get config with user credentials
    return this.verifyUser(id, config)
  }

  /**
   * Assign RSA keys to api or auth node configs
   */
  assignKeys (id, config) {
    if (id === 'api' || id === 'auth') {
      config.local.certPublic = this.certPublic
    }
    if (id === 'auth') {
      config.local.certPrivate = this.certPrivate
    }
  }

  /**
   * Generate root user credentials for each core node if none is given
   */
  async verifyUser (id, config) {
    if ((id === 'core' || id === 'api') && !config.provided.userSecret) {
      let grantAuthPerms = false

      // Set auth db url if we're on the auth core (this will trigger users
      // actually being created)
      if (config.provided.group === 'auth' && id === 'core') {
        this.resolveUrl(config.provided.mongoUrl || config.local.mongoUrl)
        this.authDb = config.provided.mongoDb || config.local.mongoDb
        grantAuthPerms = true
      }

      // use node group as prefix if available (otherwise we'll only have
      // 'api' and 'core' users)
      let name = config.provided.group ? `${config.provided.group} ${id}` : id
      return this.checkUser(name, config, grantAuthPerms)
    } else {
      return config
    }
  }

  async checkUser (id, config, grantAuthPerms) {
    const url = await this.authUrl
    const db = await mongodb.connect(url)

    // Create new core users on each run (dev mode only)
    const user_key = randtoken.uid(32)
    const user_secret = randtoken.uid(32)

    // Remove existing user with same id if present to prevent datbase stuffing
    await db.db(this.authDb).collection('users').deleteOne({ user_id: id })

    // Save in db
    const user = {
      user_key,
      user_secret: await bcrypt.hash(user_secret, prod ? 8 : 1),
      user_id: id,
      last_ip: [],
      scope: grantAuthPerms ? 'write_root write_auth' : 'write_root',
      refresh_token: user_key + randtoken.uid(32)
    }
    db.db(this.authDb).collection('users').insertOne(user)
    db.close()

    config.local.userKey = user_key
    config.local.userSecret = user_secret
    return config
  }
}

module.exports = new Auth()
