const CircularJSON = require('circular-json')

/**
 * Checks request against endpoints given by core node
 */
class RequestController {
  /**
   * Controls Request processing
   */
  async getResponse (req) {
    return this.send(req)
  }

  /**
   * Send request to responding node
   */
  send (req) {
    return new Promise(async resolve => {
      let nodes = await this.check(req)
      let sockets = nodes.sockets

      // At least one socket replied
      if (sockets) {
        let socket = sockets[0]

        // Generate unique callback for emit & pass to responding node
        req.id = process.hrtime().join('').toString()
        socket.emit('req', CircularJSON.stringify(req))
        blitz.log.silly('API       | Request sent')

        // Listen to socket for response.
        socket.once(req.id, data => {
          blitz.log.silly('API       | Request successful - Sending data to client')
          resolve(data)
        })
      }

      // No sockets available
      else {
        resolve(nodes.error)
      }
    })
  }

  /**
   * Check if resource nodes are busy
   */
  check (req) {
    return new Promise((resolve, reject) => {
      let sockets = []
      let request = {
        id: process.hrtime().join('').toString(),
        url: req.url
      }

      // Send check to root nsp
      this.client.root.emit('check', request)
      blitz.log.silly('API       | Check broadcasted')

      // Listen to all sockets in root nsp for response
      let sio = Object.keys(this.client.root.sockets)
      let responses = 0
      sio.forEach(sid => {
        let socket = this.client.root.sockets[sid]
        socket.once(request.id, res => {
          responses++

          // Check successful
          if (res.available) {
            blitz.log.silly('API       | Check acknowledged')
            sockets.push(socket)
          }

          // All nodes checked
          if (sio.length === responses) {
            if (sockets.length > 0) {
              resolve({
                available: true,
                sockets
              })
            } else {
              resolve({
                available: false,
                error: {
                  statusCode: 404,
                  method: 'send',
                  body: 'No endpoint matched the request.'
                }
              })
            }
          }
        })
      })

      // Wait before rejecting
      setTimeout(() => {
        resolve({
          available: false,
          error: {
            statusCode: 503,
            method: 'send',
            body: 'All nodes currently busy. Please try again later.'
          }
        })
      }, blitz.config[blitz.id].requestTimeout)
    })
  }
}

module.exports = RequestController
