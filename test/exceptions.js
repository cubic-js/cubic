const assert = require('assert')

/**
 * Tests for properly handling unsual requests.
 */
describe('Exceptions', function () {
  // File doesn't exist
  it('should respond with 404 when requesting non-existant file', async function () {
    const res = await cubic.nodes.api.server.ws.request.getResponse({
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
    const res = await cubic.nodes.api.server.ws.request.getResponse({
      method: 'GET',
      url: '/nonauth',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.statusCode === 403)
  })

  // Rate limits
  it('should respond with 429 when rate limits are enforced', async function () {
    const req = () => cubic.nodes.api.server.ws.request.getResponse({
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
    const res = await cubic.nodes.api.server.ws.request.getResponse({
      method: 'GET',
      url: '/query',
      query: {},
      params: {},
      user: { scp: [] }
    })
    assert(res.statusCode === 400)
  })
})
