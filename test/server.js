const assert = require('assert')
const loader = require('cubic-loader')
const Api = require(process.cwd())
const Auth = require('cubic-auth')
const Core = require('cubic-core')
const Client = require('cubic-client')
const request = require('request-promise')

// Config
const endpointPath = `${process.cwd()}/test/endpoints`
const publicPath = `${process.cwd()}/test/assets`
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE

/**
 * Helper function get http response as soon as server loaded
 */
async function get (url) {
  return new Promise(async resolve => {
    try {
      resolve(await request.get(`http://localhost:3003${url}`))
    } catch (err) {
      setTimeout(async () => {
        resolve(await get(url))
      }, 500)
    }
  })
}

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
})

/**
 * Test for properly connecting to cubic-api node.
 */
describe('Server', function () {
  it('should respond with "bar" on GET /foo (ws)', async function () {
    const client = new Client()
    await client.connecting
    assert(await client.get('/foo'))
  })

  it('should respond with "bar" on GET /foo (http)', async function () {
    assert(await get('/foo'))
  })
})
