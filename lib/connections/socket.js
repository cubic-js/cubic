const SocketClient = require('socket.io-client')
const socket = new SocketClient('http://localhost:3400')


/**
 * Handles Socket Requests
 */
class Socket{

    constructor(){}

    send(method, endpoint, resolve, reject){
        socket.emit(method, endpoint)
        socket.on('res', response => {
            resolve(response.body)
        })
    }
}

module.exports = Socket
