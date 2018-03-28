const assert = require('assert')
const Client = require('../../blitz-js-query')

/**
 * Tests for properly responding to usual requests.
 */
describe('Requests', function () {
  let client, api, mongo, db, endpoint
  this.timeout(10000)

  before(async function() {
    client = new Client()
    api = blitz.nodes.core.client.api
    mongo = await blitz.nodes.core.client.endpointController.db
    db = mongo.db(blitz.config.core.mongoDb)
    await client.connecting
  })

  // GET check
  it('should respond with "bar" on GET /foo', async function () {
    const res = await client.get('/foo')
    assert(res === 'bar')
  })

  // POST check on same URL
  it('should respond with "foo" on POST /foo', async function () {
    const payload = 'foo'
    const res = await client.post({ url: '/foo', body: payload })
    assert(res === payload)
  })

  // Raw file check
  it('should send buffer of guy fieri on GET /guy-fieri.jpg', async function () {
    const res = await client.get('/guy-fieri.jpg')
    assert(res instanceof Buffer)
  })

  // Pub/Sub
  it('should emit event on incoming publish request', function(done) {
    const endpoint = new blitz.nodes.core.Endpoint(api, db, '/test')
    client.subscribe('/test', done)
    endpoint.publish('foo')
  })
})