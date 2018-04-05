const assert = require('assert')
const loader = require('blitz-js-loader')
const Api = require('blitz-js-api')
const Auth = require(process.cwd())
const Core = require('blitz-js-core')
const Client = require('blitz-js-query')

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
describe('Server', function () {
  it('should become ready to connect to', async function () {
    const client = new Client()
    await client.connecting
  })
})