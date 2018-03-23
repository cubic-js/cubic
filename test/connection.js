const assert = require('assert')
const loader = require('blitz-js-loader')
const Api = require('blitz-js-api')
const Auth = require('blitz-js-auth')
const Core = require(process.cwd())

/**
 * Test for properly connecting to blitz-js-api node
 */
describe('Connection', function () {
  this.timeout(0)

  // Load up blitz-js api to connect to and auth node to authenticate at
  before(async () => {
    loader({ logLevel: 'silent' })
    await blitz.use(new Auth())
    await blitz.use(new Api())
    await blitz.use(new Core({ endpointPath: `${process.cwd()}/test/endpoints` }))
  })

  // Connect to API node
  it('should emit "ready" when connected to the API node', function (done) {
    this.timeout(30000)
    blitz.nodes.core.client.api.on('ready', () => {
      done()
    })
  })

  /**
   * TODO: move the below checks into stuff for filesystem stuffs
   * instead, check for 'any response' at all, cus this is just connection stuff
   */

  // Respond to check for /foo endpoint in /endpoints/foo.js
  it('should respond affirmatively to check for /foo', async function () {
    this.timeout(2000)
    const check = await blitz.nodes.api.server.http.request.check({
      id: process.hrtime().join('').toString(),
      url: '/foo'
    })
    assert(check.available)
  })

  // Respond negatively to non-existant file
  it('should respond negatively to check for non-existant file', async function () {
    this.timeout(2000)
    const check = await blitz.nodes.api.server.http.request.check({
      id: process.hrtime().join('').toString(),
      url: '/spam.js'
    })
    assert(!check.available)
  })
})