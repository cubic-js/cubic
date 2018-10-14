const assert = require('assert')
const Client = require(`${process.cwd()}/packages/client`)
const auth = require('./lib/auth.js')
let spark

describe('Client', function () {
  before(function () {
    cubic.nodes.api.server.ws.app.on('connection', s => {
      const { user } = s.request

      if (user.uid === 'cubic-client-test') {
        spark = s
      }
    })
  })

  it('should connect to API node with default config', async function () {
    global.clientDefault = new Client()
    await clientDefault.connecting
  })

  it('should connect to API node with registered user', async function () {
    await auth.init()
    const user_key = await auth.getUserKey()
    global.clientAuth = new Client({ user_key, user_secret: 'test' })
    await clientAuth.connecting
  })

  it('should reconnect to the server when connections are lost', async function () {
    // Make a request on disconnect. This will both ensure that a connection
    // is re-established as well as requests being queued during downtimes.
    async function reconnect () {
      spark.end(undefined, { reconnect: true })
      assert(await clientAuth.get('/foo') === 'bar')
    }

    // Run reconnect test multiple times. We've not made the best experiences
    // with socket.io's reconnect reliability in the past, especially when
    // there were many reconnects within a short period of time.
    for (let i = 0; i < 20; i++) {
      await reconnect()
    }
  })

  it('should authenticate as given user on login()', async function () {
    const user_key = await auth.getUserKey()
    const client = new Client()
    await client.login(user_key, 'test')
    const res = await client.get('/auth')
    assert(res === 'ok')
  })

  it('should refresh access token with refresh token on setRefreshToken()', async function () {
    const client = new Client()
    const refresh_token = await auth.getRefreshToken()
    await client.setRefreshToken(refresh_token)
    await client.connection.reconnect()
    assert(client.connection.auth.access_token)
  })

  it('should return refresh token on getRefreshToken()', async function () {
    const client = new Client()
    await client.setRefreshToken('test')
    assert(await client.getRefreshToken() === 'test')
  })

  it('should set access token on setAccessToken()', async function () {
    const client = new Client()
    const access_token = await auth.getAccessToken()
    await client.setAccessToken(access_token)
    const res = await client.get('/auth')
    assert(res === 'ok')
  })

  it('should return access token on getAccessToken()', async function () {
    const client = new Client()
    const access_token = await auth.getAccessToken()
    await client.setAccessToken(access_token)
    assert(await client.getAccessToken() === access_token)
  })
})
