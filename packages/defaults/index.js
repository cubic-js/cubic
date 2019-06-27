const fs = require('fs')
const ncp = require('ncp').ncp
const promisify = require('util').promisify
const fileExists = promisify(fs.lstat)
const copy = promisify(ncp)

/**
 * Handle default files for the cubic bootstrap process
 */
class Defaults {
  async verify () {
    for (let path of [
      `${process.cwd()}/ui`,
      `${process.cwd()}/config`,
      `${process.cwd()}/api`,
    ]) {
      if (!await this.exists(path)) {
        await copy(path.replace(process.cwd(), __dirname), path)
      }
    }
  }

  async exists (path) {
    try {
      await fileExists(path)
      return true
    } catch (err) {
      return false
    }
  }
}

module.exports = new Defaults()
