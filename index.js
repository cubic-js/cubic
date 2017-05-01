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
            api_url: "http://localhost:3010/",
            auth_url: "http://localhost:3030/",

            // Connection Config
            use_socket: true,
            namespace: '',

            // Authorization Config
            user_key: null,
            user_secret: null,
            ignore_limiter: false
        }, options)

        // Add "/" to url if not existing
        if (this.options.api_url.slice(-1) !== "/") this.options.api_url += "/"
        if (this.options.auth_url.slice(-1) !== "/") this.options.auth_url += "/"

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
    query(verb, query) {
        if (query[0] = "/") query = query.slice(1, query.length)

        this.connection.request(verb, this.options.api_url + query)
            .then(res => resolve(res))
            .catch(err => {
                throw (new Error(err))
            })
    }


    get(query) {
        return new Promise((resolve, reject) => {
            this.query("GET", query).then((res) => resolve(res))
        })
    }

    post(query) {
        return new Promise((resolve, reject) => {
            this.query("POST", query).then((res) => resolve(res))
        })
    }

    put(query) {
        return new Promise((resolve, reject) => {
            this.query("PUT", query).then((res) => resolve(res))
        })
    }

    delete(query) {
        return new Promise((resolve, reject) => {
            this.query("DELETE", query).then((res) => resolve(res))
        })
    }
}

module.exports = Blitz
