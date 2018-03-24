const assert = require('assert')


/**
 * Tests for properly responding to usual requests.
 */
describe('Requests', function () {

  // GET check
  it('should respond with "bar" on GET /foo', async function () {
    const res = await blitz.nodes.api.server.http.request.send({
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
    const res = await blitz.nodes.api.server.http.request.send({
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
    const res = await blitz.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/foo/bar/stuff',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.body === 'bar')
  })

  // Raw file check
  it('should send buffer of guy fieri', async function () {
    const res = await blitz.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/guy-fieri.jpg',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.body instanceof Buffer)
  })

  // Respond negatively to non-existant file/endpoint
  it('should respond with 404 when requesting non-existant file', async function () {
    const res = await blitz.nodes.api.server.http.request.send({
      method: 'GET',
      url: '/spam.js',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.statusCode === 404)
  })
})


/**
 * Tests for properly handling unsual requests.
 */
describe('Exceptions', function () {
})