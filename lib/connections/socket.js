const io = require('socket.io-client')

/**
 * Handles Socket Requests
 */
class Socket {

    constructor(auth_options, resolve, reject) {

        // Credentials provided?
        if (auth_options) {

            // Close existing connections
            if (this.socket) {
                this.socket.disconnect()
            }

            // Set new socket with supplied options
            this.socket = new io('http://localhost:3400/', {
                query: 'bearer=' + auth_options.token,
                reconnect: true,
                forceNew: true
            })
        }

        // No Credentials provided
        else {
            this.socket = new io('http://localhost:3400/', {
                reconnect: true,
                forceNew: true
            })
        }

        // Resolve Promise
        this.socket.on('connect', () => {

            // Reset listeners for further connections
            this.socket.off('error')
            this.socket.off('connect')

            resolve()
        })

        // Invalid Token?
        this.socket.on('error', err => {
            console.error(" ")
            console.error("\x1b[31m", 'nexus-stats-api ERR: ' + err)
            console.error(" ")

            // Reset listeners for further connections
            this.socket.off('error')
            this.socket.off('connect')
        })
    }


    /**
     * Send method, requests target endpoint, resolves promise with response
     */
    send(method, query) {
        return new Promise((resolve, reject) => {
            this.socket.emit(method, query, (res) => resolve(res))
        })
    }
}

module.exports = Socket
