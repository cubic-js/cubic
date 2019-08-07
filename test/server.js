const cwd = process.cwd()
const assert = require('assert')
const fs = require('fs')
const rmrf = require('rimraf')
const { promisify } = require('util')
const fileExists = promisify(fs.lstat)
const removeFile = promisify(rmrf)
const moveFile = promisify(fs.rename)
const Cubic = require(cwd)
const defaults = require(`${cwd}/packages/defaults`)
const Auth = require(`${cwd}/packages/auth`)
const Api = require(`${cwd}/packages/api`)
const Ui = require(`${cwd}/packages/ui`)
const Client = require(`${cwd}/packages/client`)
const get = require('./lib/get.js')

/**
 * Bootstrap process. Essentially same method, just different configs for
 * databases in drone-ci
 */
before(async function () {
  await moveFile(`${process.cwd()}/test/config`, `${process.cwd()}/config`)
  await defaults.verify()
  const ci = process.env.DRONE
  const redisUrl = 'redis://redis'
  const mongoUrl = 'mongodb://mongodb'
  const endpointPath = `${process.cwd()}/test/endpoints`
  const cubic = new Cubic({ logLevel: 'silent' })
  await cubic.use(new Auth(ci ? { api: { redisUrl, mongoUrl } } : {}))
  await cubic.use(new Api(ci ? { redisUrl, mongoUrl, endpointPath } : { endpointPath }))
  await cubic.use(new Ui(ci ? { api: { redisUrl, mongoUrl } } : {}))
})

/**
 * Test for endpoint parent class functionality
 */
describe('Server', function () {
  it('should create default files', async function () {
    assert(await fileExists(`${process.cwd()}/api`))
    assert(await fileExists(`${process.cwd()}/config`))
    assert(await fileExists(`${process.cwd()}/ui`))
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

// Remove default files
after(async function () {
  await moveFile(`${process.cwd()}/config`, `${process.cwd()}/test/config`)
  await removeFile(`${process.cwd()}/ui`)
  await removeFile(`${process.cwd()}/api`)
  await removeFile(`${process.cwd()}/assets`)
})
