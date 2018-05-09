const assert = require('assert')
const Client = require('cubic-client')
const get = require('./lib/get.js')

/**
 * Tests for properly responding to usual requests.
 */
describe('Middleware', function () {
  // Native middleware
  it('should respond with "kek" when applying native express middleware', async function () {
    const server = cubic.nodes.api.server

    server.http.app._router.stack.pop()
    server.http.app.use((req, res, next) => res.send('kek'))
    server.applyRoutes(server.config)

    assert(await get('/foo') === 'kek')
  })

  it('should respond with "kek" when applying custom middleware', async function () {
    const client = new Client()

    cubic.nodes.api.use((req, res) => {
      return res.send('kek')
    })

    assert(await client.get('/foo') === 'kek')
  })
})
