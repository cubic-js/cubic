const CircularJSON = require('circular-json') // required for passing req object

/**
 * Checks request against endpoints given by core node
 */
class RequestController {
  constructor (config) {
    this.config = config
  }

  async getResponse (req) {
    return this.send(req)
  }

  /**
   * Send request to responding node
   */
  send (req) {
    return new Promise(async resolve => {
      let checked = await this.check(req)
      let socket = checked.socket

      if (socket) {
        // Generate unique callback for emit & pass to responding node
        req.id = `req-${req.url}-${process.hrtime().join('').toString()}`
        socket.emit('req', CircularJSON.stringify(req))
        cubic.log.silly(`${this.config.prefix} | Request sent`)

        // Listen to socket for response.
        socket.once(req.id, data => {
          cubic.log.silly(`${this.config.prefix} | Request successful - Sending data to client`)
          resolve(data)
        })
      }

      // No sockets available
      else {
        resolve(checked.error)
      }
    })
  }

  /**
   * Check if resource nodes are busy
   */
  check (req) {
    return new Promise(resolve => {
      let request = {
        id: `check-${req.url}-${process.hrtime().join('').toString()}`,
        url: req.url,
        method: req.method
      }
      let notFound = false

      // Send check to root nsp
      this.client.root.emit('check', request)
      cubic.log.silly(`${this.config.prefix} | Check broadcasted`)

      // Listen to all sockets in root nsp for response
      this.checkAll(resolve, request, notFound)

      // Reject if check takes too long, assuming nodes are busy. If any node
      // already responded with 'not found', then respond with 404 instead of
      // 503 status.
      setTimeout(() => {
        if (notFound) {
          resolve({
            available: false,
            error: {
              statusCode: 404,
              body: {
                error: 'Not found.',
                reason: 'We couldn\'t find what you\'re looking for, but some nodes didn\'t actually respond in time, so you might wanna try again.'
              }
            }
          })
        } else {
          resolve({
            available: false,
            error: {
              statusCode: 503,
              method: 'send',
              body: {
                error: 'All nodes currently busy.',
                reason: 'Ping to workers timed out.'
              }
            }
          })
        }
      }, this.config.requestTimeout)
    })
  }

  /**
   * Contact each connected socket and check if they have the file  we're 
   * looking for.
   */
  async checkAll (resolve, request, notFound) {
    let sio = Object.keys(this.client.root.sockets)
    let responses = 0

    for (let sid of sio) {
      let socket = this.client.root.sockets[sid]
      // console.log(socket) // detect weird 3rd socket
      socket.once(request.id, res => {
        responses++

        // Check successful -> get response from this node.
        if (res.available) {
          cubic.log.silly(`${this.config.prefix} | Check acknowledged`)
          resolve({
            available: true,
            socket
          })
        } else {
          notFound = true
        }

        // All nodes checked, but none already resolved means the endpoint isn't
        // available.
        if (sio.length === responses) {
          resolve({
            available: false,
            error: {
              statusCode: 404,
              method: 'send',
              body: {
                error: 'Not found.',
                reason: 'We couldn\'t find what you\'re looking for. All nodes responded in time, so it\'s definitely not there.'
              }
            }
          })
        }
      })
    }
  }
}

module.exports = RequestController
