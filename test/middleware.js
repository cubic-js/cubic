const assert = require('assert')
const Client = require(`${process.cwd()}/packages/client`)
const get = require('./lib/get.js')

describe('Middleware', function () {
  it('should respond with "kek" when applying native http middleware', async function () {
    const server = cubic.nodes.api.server
    server.http.app.wares.unshift((req, res, next) => res.end('kek'))

    assert(await get('/foo') === 'kek')
  })

  it('should respond with "kek" when applying custom middleware', async function () {
    const client = new Client()
    cubic.nodes.api.use((req, res) => res.send('kek'))

    assert(await client.get('/foo') === 'kek')
  })
})
