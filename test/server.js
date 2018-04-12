const assert = require('assert')
const loader = require('cubic-loader')
const Api = require(process.cwd())
const Auth = require('cubic-auth')
const Core = require('cubic-core')
const Client = require('cubic-client')
const request = require('request-promise')

// Config
const endpointPath = `${process.cwd()}/test/endpoints`
const publicPath = `${process.cwd()}/test/assets`
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE_CI

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
  it('should open HTTP server on localhost:3003', async function () {
    try {
      await request.get('http://localhost:3003')
    } catch (err) {
      assert(!/(ECONNREFUSED|ETIMEDOUT)/.test(err.message))
    }
  })

  // Socket.io
  it('should open Socket.io server on localhost:3003', async function () {
    const client = new Client()
    await client.connecting
  })

  // Core nodes
  it('should have core nodes connect to root namespace', function (done) {
    cubic.nodes.api.server.sockets.root.on('connect', () => done())
  })
})
