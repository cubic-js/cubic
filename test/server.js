const assert = require('assert')
const loader = require('cubic-loader')
const Api = require('cubic-api')
const Auth = require(process.cwd())
const Core = require('cubic-core')
const Client = require('cubic-client')

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
describe('Server', function () {
  it('should become ready to connect to', async function () {
    const client = new Client()
    await client.connecting
  })
})