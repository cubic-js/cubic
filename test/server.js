const loader = require('cubic-loader')
const Api = require('cubic-api')
const Auth = require('cubic-auth')
const Core = require('cubic-core')
const Ui = require(process.cwd())
const request = require('request-promise')

// Config
const endpointPath = `${process.cwd()}/test/endpoints`
const publicPath = `${process.cwd()}/test/assets`
const sourcePath = `${process.cwd()}/test/ui`
const sitesPath = `${process.cwd()}/test/ui/sites`
const redisUrl = 'redis://redis'
const mongoUrl = 'mongodb://mongodb'
const ci = process.env.DRONE_CI

async function getIndex () {
  return new Promise(async resolve => {
    try {
      resolve(await request.get('http://localhost:3000'))
    } catch (err) {
      setTimeout(async () => {
        resolve(await getIndex())
      }, 500)
    }
  })
}

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
  await cubic.use(new Ui(ci ? {
    api: { redisUrl },
    core: {
      redisUrl,
      mongoUrl,
      endpointPath: `${process.cwd()}/test/ui/endpoints`,
      publicPath: `${process.cwd()}/test/assets`
    },
    sourcePath,
    sitesPath
  } : {
    core: {
      endpointPath: `${process.cwd()}/test/ui/endpoints`,
      publicPath: `${process.cwd()}/test/assets`
    },
    sourcePath,
    sitesPath
  }))
})

/**
 * Test for properly connecting to cubic-api node.
 */
describe('Server', function () {
  it('should become ready to connect to', async function () {
    await getIndex()
  })
})
