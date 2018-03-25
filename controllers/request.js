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
      let nodes = await this.check(req)
      let sockets = nodes.sockets

      // At least one socket replied
      if (sockets) {
        let socket = sockets[0]

        // Generate unique callback for emit & pass to responding node
        req.id = `req-${req.url}-${process.hrtime().join('').toString()}`
        socket.emit('req', CircularJSON.stringify(req))
        blitz.log.silly(`${this.config.prefix} | Request sent`)

        // Listen to socket for response.
        socket.once(req.id, data => {
          blitz.log.silly(`${this.config.prefix} | Request successful - Sending data to client`)
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
        id: `check-${req.url}-${process.hrtime().join('').toString()}`,
        url: req.url,
        method: req.method
      }

      // Send check to root nsp
      this.client.root.emit('check', request)
      blitz.log.silly(`${this.config.prefix} | Check broadcasted`)

      // Listen to all sockets in root nsp for response
      let sio = Object.keys(this.client.root.sockets)
      let responses = 0
      sio.forEach(sid => {
        let socket = this.client.root.sockets[sid]
        socket.once(request.id, res => {
          responses++

          // Check successful
          if (res.available) {
            blitz.log.silly(`${this.config.prefix} | Check acknowledged`)
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
      }, this.config.requestTimeout)
    })
  }
}

module.exports = RequestController
