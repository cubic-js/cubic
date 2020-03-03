const assert = require('assert')
const Client = require(`${process.cwd()}/packages/client`)
const Endpoint = require('cubic-api/endpoint')

/**
 * Tests for properly responding to usual requests.
 */
describe('Requests', function () {
  let client, uiClient, options

  before(async function () {
    client = new Client()
    uiClient = new Client({ api_url: 'ws://localhost:3000/ws' })
    const endpoints = cubic.nodes.api.server.ws.endpoints
    const db = this.db = (await endpoints.db).db(endpoints.config.mongoDb)
    options = { db, cache: endpoints.cache, ws: endpoints.ws }
    await client.connection._connecting()
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
    const guy = await uiClient.get('/guy-fieri.jpg')
    assert(guy.type === 'Buffer' || guy instanceof Buffer)
  })

  // Pub/Sub
  it('should emit event with "foo" on /test when published.', function (done) {
    const endpoint = new Endpoint({ ...options, ...{ url: '/test' } })
    client.subscribe('/test', foo => {
      assert(foo === 'foo')
      done()
    })
    // Give subscribe request enough time to arrive first. Hardcoding it like this
    // because something is probably terribly wrong if it still didn't subscribe
    // after a full second.
    setTimeout(() => endpoint.publish('foo'), 1000)
  })
})
