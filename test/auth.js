const assert = require('assert')
const Client = require(process.cwd())
const auth = require('./lib/auth.js')

/**
 * Tests for properly responding to usual requests.
 */
describe('Auth', function () {

  it('should authenticate as given user on login()', async function () {
    const user_key = await auth.getUserKey()
    const client = new Client()
    await client.login(user_key, 'test')
    const res = await client.get('/auth')
    assert(res === 'ok')
  })

  it('should refresh access token with refresh token on setRefreshToken()', async function() {
    const client = new Client()
    const refresh_token = await auth.getRefreshToken()
    await client.setRefreshToken(refresh_token)
    await client.connection.reload()
    await client.connections()
    assert(client.connection.auth.access_token)
  })

  it('should return refresh token on getRefreshToken()', async function() {
    const client = new Client()
    await client.setRefreshToken('test')
    assert(await client.getRefreshToken() === 'test')
  })

  it('should set access token on setAccessToken()', async function() {
    const client = new Client()
    const access_token = await auth.getAccessToken()
    await client.setAccessToken(access_token)
    const res = await client.get('/auth')
    assert(res === 'ok')
  })

  it('should return access token on getAccessToken()', async function() {
    const client = new Client()
    const access_token = await auth.getAccessToken()
    await client.setAccessToken(access_token)
    assert(await client.getAccessToken() === access_token)
  })
})