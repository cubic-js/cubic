'use strict'

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
        if (auth_options.token) {

            // Set new socket with supplied options
            this.socket = new io(auth_options.api_url + auth_options.namespace, {
                query: 'bearer=' + auth_options.token,
                reconnect: true,
                forceNew: true
            })
        }

        // No Credentials provided
        else {
            this.socket = new io(auth_options.api_url + auth_options.namespace, {
                reconnect: true,
                forceNew: true
            })
        }

        // Resolve Promise
        this.socket.on('connect', () => {
            this.socket.off("connect")
            this.socket.off("error")
            resolve()
        })

        // Invalid Token?
        this.socket.on('error', err => {
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
