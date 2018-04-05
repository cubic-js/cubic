const assert = require('assert')

/**
 * Tests for properly responding to usual requests.
 */
describe('Requests', function () {

  // GET check
  it('should respond with "bar" on GET /foo', async function () {
    const res = await cubic.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/foo',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.body === 'bar')
  })

  // POST check on same URL
  it('should respond with "foo" on POST /foo', async function () {
    const payload = 'foo'
    const res = await cubic.nodes.api.server.http.request.send({
      method: 'POST',
      url: '/foo',
      body: payload,
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.body === payload)
  })

  // URL placeholder check
  it('should respond with "bar" on GET /foo/bar/stuff', async function () {
    const res = await cubic.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/foo/bar/stuff',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.body === 'bar')
  })

  // Raw file check
  it('should send buffer of guy fieri on GET /guy-fieri.jpg', async function () {
    const res = await cubic.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/guy-fieri.jpg',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.body instanceof Buffer)
  })
})


/**
 * Tests for properly handling unsual requests.
 */
describe('Exceptions', function () {

  // File doesn't exist
  it('should respond with 404 when requesting non-existant file', async function () {
    const res = await cubic.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/spam.js',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.statusCode === 404)
  })

  // Unauthorized
  it('should respond with 403 when lacking access scope to endpoint', async function () {
    const res = await cubic.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/auth',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.statusCode === 403)
  })

  // Rate limits
  it('should respond with 429 when rate limits are enforced', async function () {
    const req = () => cubic.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/ratelimit',
      query: {},
      params: {},
      user: { scp: [] }
    })
    let res

    // Spam that endpoint
    for (let i = 0; i < 20; i++) {
      res = await req()
    }
    assert(res.statusCode === 429)
  })

  // Required query params
  it('should respond with 400 when required query param is missing', async function () {
    const res = await cubic.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/query',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.statusCode === 400)
  })
})