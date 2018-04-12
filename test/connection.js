const assert = require('assert')
const loader = require('cubic-loader')
const Api = require('cubic-api')
const Auth = require('cubic-auth')
const Core = require(process.cwd())

// Config
const endpointPath = `${process.cwd()}/test/endpoints`
const publicPath = `${process.cwd()}/test/assets`
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE_CI

/**
 * Load up cubic api to connect to and auth node to authenticate at.
 */
before(async () => {
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
