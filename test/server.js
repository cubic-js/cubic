const loader = require('cubic-loader')
const Api = require('cubic-api')
const Auth = require(process.cwd())
const Core = require('cubic-core')
const Client = require('cubic-client')

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
describe('Server', function () {
  it('should become ready to connect to', async function () {
    const client = new Client()
    await client.connecting
  })
})
