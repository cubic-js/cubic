'use strict'

const extend = require('deep-extend')
const Connection = require('./lib/connection.js')

class Blitz {

    /**
     * Merge default options with client options
     */
    constructor(options) {
        this.options = extend({

            // Resource Config
            api_url: "http://localhost:3010/",
            auth_url: "http://localhost:3030/",

            // Connection Config
            use_socket: true,
            namespace: '/',

            // Authorization Config
            user_key: null,
            user_secret: null,
            ignore_limiter: false
        }, options)

        // Remove "/" from url's
        let api = this.options.api_url
        let auth = this.options.auth_url
        this.options.api_url = api[api.length - 1] === "/" ? api.slice(0, -1) : api
        this.options.auth_url = auth[auth.length - 1] === "/" ? auth.slice(0, -1) : auth
    }


    /**
     * Connect by getting tokens and setting up clients
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.connection = new Connection(this.options)
            this.connection.connect().then(() => resolve())
        })
    }


    /**
     * Subscribe to certain endpoints
     */
    subscribe(endpoint) {
        this.connection.client.emit("subscribe", endpoint)
    }


    /**
     * Event listening for socket.io
     */
    on(ev, fn) {
        this.connection.client.on(ev, fn)
    }


    /**
     * Expose Socket client emit
     */
    emit(ev, data) {
        this.connection.client.emit(ev, data)
    }


    /**
     * RESTful methods for manual interaction
     */
    query(verb, query) {
        return new Promise((resolve, reject) => {

            // Let connection handle request
            this.connection.request(verb, query)
                .then(res => resolve(res))
                .catch(err => {
                    throw (new Error(err))
                })
        })
    }

    get(query) {
        return new Promise((resolve, reject) => {
            this.query("GET", query).then((res) => resolve(res))
        })
    }

    post(url, body) {
        let query = {
            url: url,
            body: body
        }
        return new Promise((resolve, reject) => {
            this.query("POST", query).then((res) => resolve(res))
        })
    }

    put(url, body) {
        let query = {
            url: url,
            body: body
        }
        return new Promise((resolve, reject) => {
            this.query("PUT", query).then((res) => resolve(res))
        })
    }

    patch(url, body) {
        let query = {
            url: url,
            body: body
        }
        return new Promise((resolve, reject) => {
            this.query("PATCH", query).then((res) => resolve(res))
        })
    }

    delete(url, body) {
        let query = {
            url: url,
            body: body
        }
        return new Promise((resolve, reject) => {
            this.query("DELETE", query).then((res) => resolve(res))
        })
    }
}

module.exports = Blitz
