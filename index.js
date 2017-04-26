'use strict'

const extend = require('deep-extend')
const Connection = require('./lib/connection.js')
const EventEmitter = require('event-emitter-es6')

class Blitz extends EventEmitter {

    /**
     * Merge default options with client options
     */
    constructor(options) {
        super()

        this.options = extend({

            // Resource Config
            api_url: "https://localhost:3010/",
            auth_url: "https://localhost:3030/",

            // Connection Config
            use_socket: true,
            namespace: '',

            // Authorization Config
            user_key: null,
            user_secret: null,
            ignore_limiter: false
        }, options)

        // Establish connection to resource server w/ options
        this.connection = new Connection()
        this.connection.setup(this.options)

        // Open up client to higher level
        .then(() => {
            if (this.options.use_socket) this.client = this.connection.client.socket
        })
        .then(() => this.emit('ready'))
    }


    /**
     * RESTful methods for manual interaction
     */
    get(query) {
        return new Promise((resolve, reject) => {
            this.connection.request('GET', query)
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    post(query) {
        return new Promise((resolve, reject) => {
            this.connection.request('POST', query)
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    put(query) {
        return new Promise((resolve, reject) => {
            this.connection.request('PUT', query)
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    delete(query) {
        return new Promise((resolve, reject) => {
            this.connection.request('DELETE', query)
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }
}

module.exports = Blitz
