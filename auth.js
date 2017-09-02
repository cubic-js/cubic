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
 * RSA keys are used for signing authorization tokens, user credentials
 * for authentication. The keys can still be changed manually by putting them
 * in `${process.cwd()}/config/certs/<node_id>.public|private.pem`
 */
const fs = require('fs')
const promisify = require('util').promisify
const fileExists = promisify(fs.lstat)
const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const generateKeys = require('keypair')
const mongodb = require('mongodb').MongoClient
const bcrypt = require('bcrypt-as-promised')
const crypto = require('crypto')
const randtoken = require('rand-token')
const chalk = require('chalk')

/**
 * Auth class managing keys and node credentials on load
 */
class Auth {

  constructor() {
    this.ready = new Promise(resolve => this.checkRSAKeys(resolve))
    this.authDb = new Promise(resolve => this.resolveDb = resolve)
  }

  /**
   * See if RSA keys available in file system, if not: generate and save
   */
  async checkRSAKeys(resolve) {
    let certDir = `${process.cwd()}/config/certs`

    try {
      await fileExists(`${certDir}/auth.private.pem`)
      this.certPrivate = await readFile(`${certDir}/auth.private.pem`, 'utf-8')
      this.certPublic = await readFile(`${certDir}/auth.public.pem`, 'utf-8')
    } catch (err) {
      const keys = generateKeys()
      this.certPrivate = keys.private
      this.certPublic = keys.public

      // Save keys so we can use them next time
      try {
        await mkdir(certDir)
      } catch (err) {}
      await writeFile(`${certDir}/auth.public.pem`, this.certPublic)
      await writeFile(`${certDir}/auth.private.pem`, this.certPrivate)
      await writeFile(`${certDir}/.gitignore`, '*.*')
    }
    resolve()
  }

  /**
   * Main entry point for loader
   */
  async verify(type, id, config) {
    await this.ready
    this.verifyKeys(type, id, config)
    await this.verifyUser(type, id, config)
  }

  /**
   * Generate RSA keys for API/Auth nodes
   */
  verifyKeys(type, id, config) {
    if (type === 'api' || id === 'auth_core') {
      config.local.certPublic = this.certPublic
      config.local.certPrivate = this.certPrivate
    }
  }

  /**
   * Generate root user credentials for each core node if none is given
   */
  async verifyUser(type, id, config) {
    if (type !== 'api' && !config.provided.user_secret) {
      this.complete = this.checkUser(id, config)

      if (id === 'auth_core') {
        this.resolveDb(config.provided.mongoURL || config.local.mongoURL)
      }

      await this.complete
    }
  }

  async checkUser(id, config) {
    let url = await this.authDb
    let db = await mongodb.connect(url)
    let user_key, user_secret, user_secret_auto
    let found = await db.collection('users').findOne({
      user_id: id
    })

    // Create ciphers to safely store the password in a reversable manner
    // So we can pass them into the configs later on
    // Using private cert as secret, since we already have that
    let cipher = crypto.createCipher('aes-256-cbc', this.certPrivate)
    let decipher = crypto.createDecipher('aes-256-cbc', this.certPrivate)

    // User not found -> create new, save in db and locally
    if (!found) {
      blitz.log.silly(`${id} credentials not found - creating..`)
      user_key = randtoken.uid(256)
      user_secret = randtoken.uid(256)
      user_secret_auto = cipher.update(user_secret, 'utf-8', 'hex')
      user_secret_auto += cipher.final('hex')

      let user = {
        user_key,
        user_secret: await bcrypt.hash(user_secret),
        user_secret_auto,
        user_id: id,
        last_ip: [],
        scope: 'root_write',
        refresh_token: user_key + randtoken.uid(256)
      }
      db.collection('users').insertOne(user)
      console.log(`
:: ${chalk.yellow(`Auto-generated root credentials for your ${id} node. Make sure to save these credentials if you plan to deploy on multiple servers.`)}

user_key: ${user_key}

user_secret: ${user_secret}
`)
    }

    // Found user -> read from file
    else {
      let decrypted = decipher.update(found.user_secret_auto, 'hex', 'utf-8')
      decrypted += decipher.final('utf-8')

      // Set values for usage in config now
      user_key = found.user_key
      user_secret = decrypted
    }

    config.local.user_key = user_key
    config.local.user_secret = user_secret
  }
}

module.exports = new Auth()
