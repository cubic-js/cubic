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
            namespace: '',

            // Authorization Config
            user_key: null,
            user_secret: null,
            ignore_limiter: false
        }, options)

        // Add "/" to url if not existing
        if (this.options.api_url.slice(-1) !== "/") this.options.api_url += "/"
        if (this.options.auth_url.slice(-1) !== "/") this.options.auth_url += "/"
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

            // Get proper URL from strings & objects (see post requests)
            if (typeof query === "string") {
                if (query[0] === "/") query = query.slice(1, query.length)
                query = this.options.api_url + query
            }

            // Object as query
            else {
                if (query.url[0] === "/") {
                    query.url = query.url.slice(1, query.url.length)
                }
                query.url = this.options.api_url + query.url
            }

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
