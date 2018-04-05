const assert = require('assert')
const Client = require('cubic-client')

/**
 * Tests for properly responding to usual requests.
 */
describe('Requests', function () {
  let client, api, mongo, db, endpoint

  before(async function() {
    client = new Client()
    api = cubic.nodes.core.client.api
    mongo = await cubic.nodes.core.client.endpointController.db
    db = mongo.db(cubic.config.core.mongoDb)
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
    const res = await client.post('/foo', payload)
    assert(res === payload)
  })

  // Raw file check
  it('should send buffer of guy fieri on GET /guy-fieri.jpg', async function () {
    const res = await client.get('/guy-fieri.jpg')
    assert(res.type === 'Buffer' || res instanceof Buffer)
  })

  // Pub/Sub
  it('should emit event with "foo" on /test when published.', function(done) {
    const endpoint = new cubic.nodes.core.Endpoint(api, db, '/test')
    client.subscribe('/test', foo => {
      assert(foo === 'foo')
      done()
    })
    // For some reason eventEmitter.on() isn't fully synchronous? Just some
    // weird node or socket.io bug again. Adding a tiny delay solves it.
    setTimeout(() => endpoint.publish('foo'), 1)
  })
})