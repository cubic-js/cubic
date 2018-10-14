const assert = require('assert')
const loader = require('cubic-loader')
const Api = require('cubic-api')
const Auth = require('cubic-auth')
const Core = require('cubic-core')
const Client = require(process.cwd())
const auth = require('./lib/auth.js')
let clientAuthSocket

// Config
const endpointPath = `${process.cwd()}/test/endpoints`
const publicPath = `${process.cwd()}/test/assets`
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE

/**
 * Load up cubic api to connect to and auth node to authenticate at.
 */
before(async function () {
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
  await new Promise(resolve => setTimeout(resolve, 100))
  await auth.init()
  cubic.nodes.api.server.sockets.io.on('connect', socket => {
    if (socket.user.uid === 'cubic-client-test') {
      clientAuthSocket = socket
    }
  })
})

/**
 * Test for properly connecting to cubic-api node.
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

  it('should reconnect to the server when connections are lost', async function () {
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
    async function reconnect () {
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
    for (let i = 0; i < 20; i++) {
      await reconnect()
    }
  })
})
