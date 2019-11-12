const cwd = process.cwd()
const assert = require('assert')
const fs = require('fs')
const rmrf = require('rimraf')
const { promisify } = require('util')
const fileExists = promisify(fs.lstat)
const removeFile = promisify(rmrf)
const moveFile = promisify(fs.rename)
const Cubic = require(cwd)
const defaults = require('cubic-defaults')
const Auth = require('cubic-auth')
const Api = require('cubic-api')
const Ui = require('cubic-ui')
const Client = require('cubic-client')
const get = require('./lib/get.js')

/**
 * Bootstrap process. Essentially same method, just different configs for
 * databases in drone-ci
 */
before(async function () {
  await moveFile(`${cwd}/packages/defaults/config`, `${cwd}/config`)
  await defaults.verify()
  const ci = process.env.DRONE
  const redisUrl = 'redis://redis'
  const mongoUrl = 'mongodb://mongodb'
  const endpointPath = `${cwd}/test/endpoints`
  const cubic = new Cubic({ logLevel: 'silent' })
  await cubic.use(new Auth(ci ? { api: { redisUrl, mongoUrl } } : {}))
  await cubic.use(new Api(ci ? { redisUrl, mongoUrl, endpointPath } : { endpointPath }))
  await cubic.use(new Ui(ci ? { api: { redisUrl, mongoUrl } } : {}))
})

describe('Server', function () {
  it('should create default files', async function () {
    assert(await fileExists(`${cwd}/api`))
    assert(await fileExists(`${cwd}/config`))
    assert(await fileExists(`${cwd}/ui`))
  })

  it('should load up API node - GET /foo (http/ws)', async function () {
    assert(await get('/foo') === 'bar')
    const client = new Client()
    assert(await client.get('/foo') === 'bar')
  })

  it('should load up UI node - GET /', async function () {
    await get('/', 3000)
  })
})

after(async function () {
  await moveFile(`${cwd}/config`, `${cwd}/packages/defaults/config`)
  await removeFile(`${cwd}/ui`)
  await removeFile(`${cwd}/api`)
  await removeFile(`${cwd}/assets`)
})
