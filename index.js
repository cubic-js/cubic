const fs = require('fs')
const ncp = require('ncp').ncp
const promisify = require('util').promisify
const fileExists = promisify(fs.lstat)
const copyFile = promisify(ncp)

/**
 * Handle default files for the cubic bootstrap process
 */
class Defaults {
  async verify() {
    try {
      await fileExists(`${process.cwd()}/ui`)
    } catch (err) {
      await this.copy()
    }
  }

  async copy() {
    await copyFile(`${__dirname}/ui`, `${process.cwd()}/ui`)
    await copyFile(`${__dirname}/api`, `${process.cwd()}/api`)
    await copyFile(`${__dirname}/assets`, `${process.cwd()}/assets`)
  }
}

module.exports = new Defaults()