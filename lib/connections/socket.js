const io = require('socket.io-client')

/**
 * Handles Socket Requests
 */
class Socket {

    constructor(auth_options, resolve, reject) {

        // Close existing connections
        if (this.socket) {
            this.socket.disconnect()
        }

        // Set new socket with supplied options
        this.socket = new io('http://localhost:3400/', {
            'query': 'token=' + auth_options.token
        })

        this.socket.on('connect', () => resolve())

        this.socket.on('unauthorized', err => {
            if (err.data.type == "UnauthorizedError" || err.data.code == "invalid_token") {
                // redirect user to login page perhaps?
                console.log("User's token has expired");
            }
        })
    }


    /**
     * Send method, requests target endpoint, resolves promise with response
     */
    send(method, query, resolve, reject) {
        this.socket.emit(method, query)
        this.socket.on('res', res => {
            resolve(res.body)
        })
    }
}

module.exports = Socket
