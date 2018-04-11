const assert = require('assert')
const fs = require('fs')
const rmrf = require('rimraf')
const { promisify } = require('util')
const fileExists = promisify(fs.lstat)
const removeFile = promisify(rmrf)
const load = require('cubic-loader')
const defaults = require('cubic-defaults')
const Auth = require('cubic-auth')
const Api = require('cubic-api')
const Core = require('cubic-core')
const Ui = require('cubic-ui')
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE_CI

/**
 * Test for endpoint parent class functionality
 */
describe('/index.js', function() {
  it('should load cubic with default files on bootstrap()', async function() {
    const Cubic = require(process.cwd())
    const cubic = new Cubic({ logLevel: 'silent' })
    cubic.init()
    await defaults.verify()
    await cubic.use(new Auth(ci ? {
      api: { redisUrl },
      core: { redisUrl, mongoUrl }
    } : {}))
    await cubic.use(new Api(ci ? { redisUrl } : {}))
    await cubic.use(new Core(ci ? { redisUrl, mongoUrl } : {}))
    await cubic.use(new Ui(ci ? {
      api: { redisUrl },
      core: { redisUrl, mongoUrl }
    } : {}))

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
  if (!ci) {
    after(async function() {
      await removeFile(`${process.cwd()}/api`)
      await removeFile(`${process.cwd()}/assets`)
      await removeFile(`${process.cwd()}/ui`)
    })
  }
})