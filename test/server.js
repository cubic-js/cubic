const assert = require('assert')
const loader = require('blitz-js-loader')
const Api = require(process.cwd())
const Auth = require('blitz-js-auth')
const Core = require('blitz-js-core')
const Client = require('blitz-js-query')
const request = require('request-promise')

/**
 * Load up blitz-js api to connect to and auth node to authenticate at.
 */
before(async function() {
  loader({ logLevel: 'silent' })
  await blitz.use(new Auth())
  await blitz.use(new Api())
  await blitz.use(new Core({
    endpointPath: `${process.cwd()}/test/endpoints`,
    publicPath:`${process.cwd()}/test/assets`
  }))
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