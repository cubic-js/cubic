const io = require('socket.io-client')

/**
 * Handles Socket Requests
 */
class Socket {

    /**
     * Attempts to connect to api with provided options
     */
    config(auth_options, resolve, reject) {

        // Close existing connections
        if (this.socket) {
            this.socket.disconnect()
        }

        // Credentials provided?
        if (auth_options) {

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

            // Reset listeners for further connections
            this.socket.off('error')
            this.socket.off('connect')

            throw(new Error(err))
        })
    }


    /**
     * Send query, requests target endpoint, resolves promise with response
     */
    send(verb, query) {
        return new Promise((resolve, reject) => {
            this.socket.emit(verb, query, (res) => resolve(res))
        })
    }
}

module.exports = new Socket()
