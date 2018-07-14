const assert = require('assert')
const fs = require('fs')
const rmrf = require('rimraf')
const { promisify } = require('util')
const fileExists = promisify(fs.lstat)
const removeFile = promisify(rmrf)
const request = require('request-promise')
const Cubic = require(process.cwd())
const defaults = require('cubic-defaults')
const Auth = require('cubic-auth')
const Api = require('cubic-api')
const Core = require('cubic-core')
const Ui = require('cubic-ui')
const webpack = require('../build/webpack.js')
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE
const prod = process.env.NODE_ENV === 'production'

/**
 * Helper function to resolve as soon as UI server responds with rendered UI
 */
async function getIndex () {
  return new Promise(async resolve => {
    try {
      resolve(await request.get('http://localhost:3000'))
    } catch (err) {
      setTimeout(async () => {
        resolve(await getIndex())
      }, 500)
    }
  })
}

/**
 * Bootstrap process. Essentially same method, just differnet configs for
 * databases in drone-ci
 */
before(async function () {
  await defaults.verify()

  // Bundle webpack for production before loading nodes
  if (prod) {
    await webpack()
  }

  const cubic = new Cubic({ logLevel: 'silent' })
  cubic.use(new Auth(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl }
  } : {}))
  cubic.use(new Api(ci ? { redisUrl } : {}))
  cubic.use(new Core(ci ? {
    redisUrl,
    mongoUrl
  } : {}))
  cubic.use(new Ui(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl },
    webpack: { skipBuild: prod }
  } : { webpack: { skipBuild: prod } }))
})

/**
 * Test for endpoint parent class functionality
 */
describe('bootstrap', function () {
  it('should create default files', async function () {
    assert(await fileExists(`${process.cwd()}/api`))
    assert(await fileExists(`${process.cwd()}/assets`))
    assert(await fileExists(`${process.cwd()}/ui`))
  })

  it('should load API node', async function () {
    const Client = require('cubic-client')
    const client = new Client()
    assert(await client.get('/foo') === 'bar')
  })

  it('should load up UI node', async function () {
    await getIndex()
  })

  // Remove default files
  after(async function () {
    await removeFile(`${process.cwd()}/api`)
    await removeFile(`${process.cwd()}/assets`)
    await removeFile(`${process.cwd()}/config`)
    await removeFile(`${process.cwd()}/ui`)
  })
})
