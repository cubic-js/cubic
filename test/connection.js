const assert = require('assert')
const Client = require(process.cwd())
const server = require('./lib/server.js')
const auth = require ('./lib/auth.js')
let clientAuthSocket


/**
 * Load up blitz-js api to connect to and auth node to authenticate at.
 */
before(async function() {
  await server.init()
  await auth.init()
  blitz.nodes.api.server.sockets.io.on('connect', socket => {
    if (socket.user.uid === 'test') {
      clientAuthSocket = socket
    }
  })
})


/**
 * Test for properly connecting to blitz-js-api node.
 */
describe('Connection', function () {

  it('should connect to API node with default config', async function () {
    global.clientDefault = new Client()
    await clientDefault.connections()
  })

  it('should connect to API node with registered user', async function () {
    const user_key = await auth.getUserKey()
    global.clientAuth = new Client({ user_key, user_secret: 'test' })
    await clientAuth.connections()
  })

  it('should reconnect to the server when connections are lost', async function() {
    this.timeout(20000)
    let connection = new Promise(resolve => {
      let connect = setInterval(() => {
        if (clientAuthSocket) {
          resolve()
          clearInterval(connect)
        }
      }, 100)
    })
    await connection

    // Make a request on disconnect. This will both ensure that a connection
    // is re-established as well as requests being queued during downtimes.
    async function reconnect() {
      clientAuthSocket.disconnect()
      const test = new Promise(resolve => {
        clientAuth.once('disconnect', async () => {
          const foo = await clientAuth.get('/foo')
          assert(foo === 'bar')
          resolve()
        })
      })
      await test
    }

    // Run reconnect test multiple times. We've not made the best experiences
    // with socket.io's reconnect reliability in the past, especially when
    // there were many reconnects within a short period of time.
    for (let i = 0; i < 5; i++) {
      await reconnect()
    }
  })
})