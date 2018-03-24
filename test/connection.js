const assert = require('assert')
const loader = require('blitz-js-loader')
const Api = require('blitz-js-api')
const Auth = require('blitz-js-auth')
const Core = require(process.cwd())


/**
 * Load up blitz-js api to connect to and auth node to authenticate at.
 */
before(async () => {
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
describe('Connection', function () {
  this.timeout(30000)

  // Connect to API node
  it('should emit "ready" when connected to the API node', function (done) {
    blitz.nodes.core.client.api.on('ready', () => {
      done()
    })
  })

  // Respond to check
  it('should respond to endpoint check', async function () {
    const check = await blitz.nodes.api.server.http.request.check({
      id: '0',
      url: '/foo'
    })
    assert(!check.available.error || !check.available.error.statusCode !== 503)
  })
})