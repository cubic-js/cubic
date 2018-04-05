const assert = require('assert')
const loader = require('cubic-loader')
const Api = require('cubic-api')
const Auth = require('cubic-auth')
const Core = require(process.cwd())

/**
 * Load up cubic api to connect to and auth node to authenticate at.
 */
before(async () => {
  loader({ logLevel: 'silent' })
  await cubic.use(new Auth())
  await cubic.use(new Api())
  await cubic.use(new Core({
    endpointPath: `${process.cwd()}/test/endpoints`,
    publicPath:`${process.cwd()}/test/assets`
  }))
})


/**
 * Test for properly connecting to cubic-api node.
 */
describe('Connection', function () {

  // Connect to API node
  it('should emit "ready" when connected to the API node', function (done) {
    cubic.nodes.core.client.api.on('ready', done)
  })

  // Respond to check
  it('should respond to endpoint check', async function () {
    const check = await cubic.nodes.api.server.http.request.check({
      id: '0',
      url: '/foo'
    })
    assert(!check.available.error || !check.available.error.statusCode !== 503)
  })
})