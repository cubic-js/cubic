const API = require('cubic-mono-api')
const local = require('./config/local.js')
const fs = require('fs')
const promisify = require('util').promisify
const mkdir = promisify(fs.mkdir)
const fileExists = promisify(fs.lstat)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const generateKeys = require('keypair')
const certDir = `${process.cwd()}/config/certs`

class Auth {
  constructor (options) {
    this.config = {
      local: local,
      provided: options || {}
    }
  }

  async init () {
    const { prv, pub } = await this.checkRSAKeys()
    cubic.config.auth.api.certPublic = pub
    cubic.config.auth.certPrivate = prv
    await cubic.use(new API(cubic.config.auth.api))
  }

  /**
   * Generate RSA keys for api token signatures.
   */
  async checkRSAKeys () {
    let prv, pub
    try {
      await fileExists(`${certDir}/auth.private.pem`)
      prv = await readFile(`${certDir}/auth.private.pem`, 'utf-8')
      pub = await readFile(`${certDir}/auth.public.pem`, 'utf-8')
    } catch (err) {
      // Ensure /config/certs folder exists
      try { await mkdir(`${process.cwd()}/config/`) } catch (err) {}
      try { await mkdir(certDir) } catch (err) {}

      // Generate keys and save to /config/certs
      const keys = generateKeys()
      prv = keys.private
      pub = keys.public
      await writeFile(`${certDir}/auth.public.pem`, pub)
      await writeFile(`${certDir}/auth.private.pem`, prv)
      await writeFile(`${certDir}/.gitignore`, '*')
    }
    return { prv, pub }
  }
}

module.exports = Auth
