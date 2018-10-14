const assert = require('assert')
const request = require('request-promise')
const loader = require('cubic-loader')
const Api = require('cubic-api')
const Auth = require('cubic-auth')
const Core = require(process.cwd())

// Config
const endpointPath = `${process.cwd()}/test/endpoints`
const publicPath = `${process.cwd()}/test/assets`
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE

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

async function isUp () {
  return new Promise(async resolve => {
    try {
      resolve(await request.get('http://localhost:3003/foo'))
    } catch (err) {
      setTimeout(async () => {
        resolve(await isUp())
      }, 500)
    }
  })
}

/**
 * Test for properly connecting to cubic-api node.
 */
describe('Connection', function () {
  it('should respond to endpoint check', async function () {
    const check = await cubic.nodes.api.server.http.request.check({
      url: '/foo'
    })
    assert(!check.available.error || !check.available.error.statusCode !== 503)
  })

  it('should be ready to take requests', async function () {
    await isUp()
  })
})
