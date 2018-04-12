const assert = require('assert')

/**
 * Tests for properly responding to usual requests.
 */
describe('Pub/Sub', function () {
  it('should receive "pub" on publish event for /pubsub', function (done) {
    let receivedDefault, receivedAuth
    clientDefault.subscribe('/pub-sub', data => {
      assert(data === 'pub')
      receivedDefault = true
      if (receivedAuth) done()
    })
    clientAuth.subscribe('/pub-sub', data => {
      assert(data === 'pub')
      receivedAuth = true
      if (receivedDefault) done()
    })
    clientDefault.get('/pub-sub')
  })

  it('should not receive events when unsubscribed', function (done) {
    let receivedDefault, receivedAuth
    clientDefault.subscribe('/pub-sub', data => {
      assert(data === 'pub')
      receivedDefault = true
      if (receivedAuth) done()
    })
    clientAuth.subscribe('/pub-sub', data => {
      assert(data === 'pub')
      receivedAuth = true
      if (receivedDefault) done()
    })
    clientDefault.unsubscribe('/pub-sub')
    clientAuth.unsubscribe('/pub-sub')
    clientDefault.get('/pub-sub')
    setTimeout(done, 2000)
  })
})
