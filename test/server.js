const assert = require('assert')
const loader = require('cubic-loader')
const Api = require(process.cwd())
const Auth = require('cubic-auth')
const Core = require('cubic-core')
const Client = require('cubic-client')
const get = require('./lib/get.js')

// Config
const endpointPath = `${process.cwd()}/test/endpoints`
const publicPath = `${process.cwd()}/test/assets`
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE

/**
 * Load up cubic api to connect to and auth node to authenticate at.
 */
before(async function () {
  loader({ logLevel: 'silent' })
  await cubic.use(new Auth(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl }
  } : {}))
  await cubic.use(new Api(ci ? { redisUrl } : {}))
  await cubic.use(new Core(ci ? {
    endpointPath,
    publicPath,
    redisUrl,
    mongoUrl
  } : { endpointPath, publicPath }))
})

/**
 * Test for properly connecting to cubic-api node.
 */
describe('Server', function () {
  it('should respond with "bar" on GET /foo (ws)', async function () {
    const client = new Client()
    await client.connecting
    assert(await client.get('/foo'))
  })

  it('should respond with "bar" on GET /foo (http)', async function () {
    assert(await get('/foo'))
  })
})
