const cwd = process.cwd()
const assert = require('assert')
const fs = require('fs')
const rmrf = require('rimraf')
const { promisify } = require('util')
const fileExists = promisify(fs.lstat)
const removeFile = promisify(rmrf)
const Cubic = require(cwd)
const defaults = require(`${cwd}/packages/defaults`)
const Auth = require(`${cwd}/packages/auth`)
const Api = require(`${cwd}/packages/api`)
const Core = require(`${cwd}/packages/core`)
const Ui = require(`${cwd}/packages/ui`)
const Client = require(`${cwd}/packages/client`)
const get = require('./lib/get.js')

/**
 * Bootstrap process. Essentially same method, just differnet configs for
 * databases in drone-ci
 */
before(async function () {
  await defaults.verify()
  const ci = process.env.DRONE
  const redisUrl = 'redis://redis'
  const mongoUrl = 'mongodb://mongodb'
  const endpointPath = `${process.cwd()}/test/endpoints`
  const cubic = new Cubic({ logLevel: 'silent' })
  await cubic.use(new Auth(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl }
  } : {}))
  await cubic.use(new Api(ci ? { redisUrl } : {}))
  await cubic.use(new Core(ci ? {
    redisUrl,
    mongoUrl,
    endpointPath
  } : {
    endpointPath
  }))
  await cubic.use(new Ui(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl }
  } : {}))
})

/**
 * Test for endpoint parent class functionality
 */
describe('Server', function () {
  it('should create default files', async function () {
    assert(await fileExists(`${process.cwd()}/api`))
    assert(await fileExists(`${process.cwd()}/assets`))
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

  it('should reconnect system nodes when connections are dropped', function (done) {
    const client = new Client()
    const nodes = cubic.nodes.api.server.ws.nodes
    const ln = nodes.length
    let rc = 0

    for (let i = 0; i < ln; i++) {
      const node = nodes[0] // Take the first because we'll remove them in the loop
      node.spark.end(undefined, { reconnect: true })
    }
    cubic.nodes.api.server.ws.app.on('connection', async spark => {
      if (++rc !== ln) return // Not all nodes dropped yet
      if (rc === ln) {
        assert(await client.get('/foo') === 'bar')
        done()
      }
    })
  })
})

// Remove default files
after(async function () {
  await removeFile(`${process.cwd()}/api`)
  await removeFile(`${process.cwd()}/assets`)
  await removeFile(`${process.cwd()}/config`)
  await removeFile(`${process.cwd()}/ui`)
})
