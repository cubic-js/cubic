const assert = require('assert')
const res = {
  json (arg) { return this.send(arg) },
  status () { return this },
  setHeader () {},
  redirect () {}
}
const user = {
  uid: '',
  scp: ''
}

/**
 * Tests for properly handling unsual requests.
 */
describe('Exceptions', function () {
  // File doesn't exist
  it('should respond with 404 when requesting non-existant file', async function () {
    const response = await new Promise(resolve => {
      const _res = { ...res, ...{ send (data) { resolve(data) } } }
      cubic.nodes.api.server.ws.endpoints.getResponse({
        method: 'GET',
        url: '/spam',
        user
      }, _res)
    })
    assert(response.error.includes('Not found'))
  })

  // Unauthorized
  it('should respond with 403 when lacking access scope to endpoint', async function () {
    const response = await new Promise(resolve => {
      const _res = { ...res, ...{ send (data) { resolve(data) } } }
      cubic.nodes.api.server.ws.endpoints.getResponse({
        method: 'GET',
        url: '/nonauth',
        user
      }, _res)
    })
    assert(response.error.includes('Unauthorized'))
  })

  // Rate limits
  it('should respond with 429 when rate limits are enforced', async function () {
    let response

    // Spam that endpoint
    for (let i = 0; i < 20; i++) {
      response = await new Promise(resolve => {
        const _res = { ...res, ...{ send (data) { resolve(data) } } }
        cubic.nodes.api.server.ws.endpoints.getResponse({
          method: 'GET',
          url: '/ratelimit',
          user
        }, _res)
      })
    }
    assert(response.error.includes('Rate limit'))
  })

  // Required query params
  it('should respond with 400 when required query param is missing', async function () {
    const response = await new Promise(resolve => {
      const _res = { ...res, ...{ send (data) { resolve(data) } } }
      cubic.nodes.api.server.ws.endpoints.getResponse({
        method: 'GET',
        url: '/query',
        query: {},
        user
      }, _res)
    })
    assert(response.error.includes('Missing query param'))
  })
})
