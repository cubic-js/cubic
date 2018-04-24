const assert = require('assert')
const loader = require('cubic-loader')
const Api = require('cubic-api')
const Auth = require('cubic-auth')
const Core = require('cubic-core')
const Client = require('cubic-client')
const Ui = require(process.cwd())
const webpack = require('../build/webpack.js')
const request = require('request-promise')
const defaults = require('cubic-defaults')
const { promisify } = require('util')
const rmrf = require('rimraf')
const removeFile = promisify(rmrf)

// Config
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE
const prod = process.env.NODE_ENV === 'production'

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
 * Load up cubic api to connect to and auth node to authenticate at.
 */
before(async () => {
  await defaults.verify()

  // Bundle webpack
  if (prod) {
    await webpack()
  }

  // Load Cubic
  loader({ logLevel: 'silent' })
  await cubic.use(new Auth(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl }
  } : {}))
  await cubic.use(new Api(ci ? { redisUrl } : {}))
  await cubic.use(new Core(ci ? {
    redisUrl,
    mongoUrl
  } : {}))
  await cubic.use(new Ui(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl },
    webpack: { skipBuild: prod }
  } : { webpack: { skipBuild: prod } }))
})

/**
 * Test for properly connecting to cubic-api node.
 */
describe('Server', function () {
  it('should become ready to connect to', async function () {
    const client = new Client()
    assert(await client.get('/foo') === 'bar')
  })

  it('should serve UI on localhost:3000', async function () {
    await getIndex()
  })

  after(async function () {
    await removeFile(`${process.cwd()}/api`)
    await removeFile(`${process.cwd()}/assets`)
    await removeFile(`${process.cwd()}/ui`)
  })
})
