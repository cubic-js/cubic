const assert = require('assert')
const loader = require('blitz-js-loader')
const Api = require(process.cwd())
const Auth = require('blitz-js-auth')
const Core = require('blitz-js-core')
const Client = require('blitz-js-query')
const request = require('request-promise')

// Config
const endpointPath = `${process.cwd()}/test/endpoints`
const publicPath = `${process.cwd()}/test/assets`
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE_CI

/**
 * Load up blitz-js api to connect to and auth node to authenticate at.
 */
before(async function() {
  loader({ logLevel: 'silent' })
  await blitz.use(new Auth(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl }
  } : {}))
  await blitz.use(new Api(ci ? { redisUrl } : {}))
  await blitz.use(new Core(ci ? {
    endpointPath,
    publicPath,
    redisUrl,
    mongoUrl
  } : { endpointPath, publicPath }))
})


/**
 * Test for properly connecting to blitz-js-api node.
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
  it('should have core nodes connect to root namespace', function(done) {
    blitz.nodes.api.server.sockets.root.on('connect', () => done())
  })
})