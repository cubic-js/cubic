const assert = require('assert')
const fs = require('fs')
const rmrf = require('rimraf')
const { promisify } = require('util')
const fileExists = promisify(fs.lstat)
const removeFile = promisify(rmrf)

/**
 * Test for endpoint parent class functionality
 */
describe('/index.js', function() {
  it('should load cubic with default files on bootstrap()', async function() {
    const Cubic = require(process.cwd())
    const cubic = new Cubic({ logLevel: 'silent' })
    await cubic.bootstrap()

    // Confirm files
    assert(await fileExists(`${process.cwd()}/api`))
    assert(await fileExists(`${process.cwd()}/assets`))
    assert(await fileExists(`${process.cwd()}/ui`))

    // Ping server
    const Client = require('cubic-client')
    const client = new Client()
    assert(await client.get('/foo') === 'bar')
  })

  // Remove default files
  after(async function() {
    await removeFile(`${process.cwd()}/api`)
    await removeFile(`${process.cwd()}/assets`)
    await removeFile(`${process.cwd()}/ui`)
  })
})