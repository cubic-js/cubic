'use strict'

const extend = require('deep-extend')
const Connection = require('./lib/connection.js')
const EventEmitter = require('event-emitter-es6')

class Nexus extends EventEmitter {

    /**
     * Merge default options with client options
     */
    constructor(options, callback) {
        super()

        this.options = extend({
            game: 'warframe',
            api_version: 'v1',
            use_socket: true,
            namespace: '/',
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
        })
    }

    post(query) {
        return new Promise((resolve, reject) => {
            this.connection.request('POST', query)
                .then(res => resolve(res))
        })
    }

    put(query) {
        return new Promise((resolve, reject) => {
            this.connection.request('PUT', query)
                .then(res => resolve(res))
        })
    }

    delete(query) {
        return new Promise((resolve, reject) => {
            this.connection.request('DELETE', query)
                .then(res => resolve(res))
        })
    }


    /**
     * Query method to easily create url from given params
     */
    query(verb, query) {

        let url = "http://localhost:3400/"

        // Generate Base URL
        url += this.options.game + '/'
        url += this.options.api_version + '/'
        url += query.resource + '/'
        url += query.method

        // Dynamically generate rest of URL
        let prefix = "?"
        for (var param in query) {
            if (param !== "resource" && param !== "method") {
                url += prefix + param + '=' + query[param]
                prefix = "&"
            }
        }

        // Replace spaces with standard encoding
        url = url.replace(" ", "%20")

        // Send Request
        return new Promise((resolve, reject) => {
            this.connection.request(verb, url)
                .then(res => resolve(res))
        })
    }


    /**
     * Sample method to get all stats for specific item
     */
    getItem(name, options) {
        let query = {}

        // Required Query Values
        query.resource = 'items/' + name
        query.method = "statistics"

        // Extend  with options if provided
        if (options) query = extend(query, options)

        return new Promise((resolve, reject) => {
            this.query('GET', query).then(res => resolve(res))
        })
    }
}

module.exports = Nexus
