const assert = require('assert')

/**
 * Test for endpoint parent class functionality
 */
describe('Connection', async function() {
  let api, mongo, db, endpoint

  // Prepare endpoint
  before(async () => {
    api = blitz.nodes.core.client.api
    mongo = await blitz.nodes.core.client.endpointController.db
    db = mongo.db(blitz.config.core.mongoDb)
    endpoint = new blitz.nodes.core.Endpoint(api, db, '/test')
  })

  // Redis cache
  it('should cache "foo" for url /test in redis', async function() {
    const req = { url: '/test', user: { scp: [] }}
    const res = {}
    res.status = () => res
    res.send = res.json = (data) => data

    await endpoint.cache('foo')
    const cached = await blitz.nodes.api.server.cache.check(req, res)
    assert(!cached.error)
  })

  // Pub/Sub
  it('should publish "foo" for url /test', async function() {
    await endpoint.publish('foo')
  })

  // Database operations
  it('should save and remove test object on database', async function() {
    const find = async () => endpoint.db.collection('test').find({ val: 'test' }).toArray()
    await endpoint.db.collection('test').insertOne({ val: 'test' })
    assert((await find()).length)
    await endpoint.db.collection('test').remove({ val: 'test' })
    assert(!(await find()).length)
  })
})