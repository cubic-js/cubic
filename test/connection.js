const assert = require('assert')
const Client = require(process.cwd())
const server = require('./lib/server.js')
const auth = require ('./lib/auth.js')


/**
 * Load up blitz-js api to connect to and auth node to authenticate at.
 */
before(async function() {
  await server.init()
  await auth.init()
})


/**
 * Test for properly connecting to blitz-js-api node.
 */
describe('Connection', function () {

  it('should connect to API node with default config', async function () {
    global.clientDefault = new Client()
    await clientDefault.connecting
  })

  it('should connect to API node with registered user', async function () {
    const user_key = await auth.getUserKey()
    global.clientAuth = new Client({ user_key, user_secret: 'test' })
    await clientAuth.connecting
  })

  it('should reconnect to the server when connections are lost', async function() {
    // WIP
  })
})