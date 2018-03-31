const assert = require('assert')

/**
 * Tests for properly responding to usual requests.
 */
describe('Requests', function () {

  // RESTful queries
  it('should respond with "ok" on get("/get")', async function () {
    const def = await clientDefault.get('/get')
    const auth = await clientAuth.get('/get')
    assert(def === 'ok' && auth === 'ok')
  })
  it('should respond with "ok" on post("/post")', async function () {
    const def = await clientDefault.post('/post', 'ok')
    const auth = await clientAuth.post('/post', 'ok')
    assert(def === 'ok' && auth === 'ok')
  })
  it('should respond with "ok" on put("/put")', async function () {
    const def = await clientDefault.put('/put', 'ok')
    const auth = await clientAuth.put('/put', 'ok')
    assert(def === 'ok' && auth === 'ok')
  })
  it('should respond with "ok" on patch("/patch")', async function () {
    const def = await clientDefault.patch('/patch', 'ok')
    const auth = await clientAuth.patch('/patch', 'ok')
    assert(def === 'ok' && auth === 'ok')
  })
  it('should respond with "ok" on delete("/delete")', async function () {
    const def = await clientDefault.delete('/delete', 'ok')
    const auth = await clientAuth.delete('/delete', 'ok')
    assert(def === 'ok' && auth === 'ok')
  })
})