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
            query: 'bearer=' + auth_options.token,
            reconnect: true
        })

        this.socket.on('connect', () => {
            resolve()
        })

        this.socket.on('unauthorized', res => {
            if(res === "Invalid Token"){
                console.error("Invalid Token Error")
            }
            if(res === "Expired Token"){
                console.error("Expired Token Error")
            }
        })

        this.socket.on('error', (err) => {
            console.error(err)
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
