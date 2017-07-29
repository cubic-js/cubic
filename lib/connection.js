'use strict'

const io = require('socket.io-client')
const request = require('request')
const Queue = require('./queue.js')
const Auth = require("./auth.js")

class Connection {

    constructor(options) {
        this.options = options
        this.subscriptions = []
        this.queue = new Queue(options)
        this.auth = new Auth(options)
    }


    /**
     * Socket.io client with currently stored tokens
     */
    setClient() {
        let sioConfig = this.auth.access_token ? {
            query: 'bearer=' + this.auth.access_token,
            reconnection: false // Use own reconnect for re-authentication
        } : {
            reconnection: false
        }

        // Connect to parent namespace
        this.client = io.connect(this.options.api_url + this.options.namespace, sioConfig)
        this.client.on("disconnect", () => {
            this.reconnect()
        })

        // Resubscribe after disconnect
        this.resub()

        let httpConfig = this.auth.access_token ? {
            headers: {
                authorization: "bearer " + this.auth.access_token
            }
        } : {}
        this.http = request.defaults(httpConfig)
    }


    /**
     * Get Tokens and build client
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.auth.authorize().then(() => {
                this.setClient()
                resolve()
            })
        })
    }


    /**
     * Close existing connection and start new with available tokens
     */
    reconnect() {
        if (this.reconnecting) {
            return this.reconnecting
        } else {
            this.reconnecting = new Promise((resolve, reject) => {
                this.auth.reauthorize().then(() => {

                    // Reconnect main client with new token
                    this.client.connected ? this.client.disconnect() : null
                    this.client.io.opts.query = this.auth.access_token ? 'bearer=' + this.auth.access_token : null
                    setTimeout(() => {
                        this.client.connect()

                        // Modify http requests for new token
                        let httpConfig = this.auth.access_token ? {
                            headers: {
                                authorization: "bearer " + this.auth.access_token
                            }
                        } : {}

                        this.http = request.defaults(httpConfig)
                        this.client.once("connect", () => {
                            resolve()
                            this.reconnecting = null
                        })
                    }, 1) // Socket.io is messed up, won't return a working client on reconnect if cast immediately.

                    // Retry if server unreachable
                    setTimeout(() => this.client.connected ? null : this.reconnect().then(resolve), 1000)
                })
            })
            return this.reconnecting
        }
    }


    /**
     * Rejoin Socket.IO subscriptions after connection is lost
     */
    resub() {
        this.client.on("subscribed", sub => {
            if (!this.subscriptions.includes(sub)) this.subscriptions.push(sub)
        })
        this.client.on("connect", () => {
            this.subscriptions.forEach(sub => this.client.emit("subscribe", sub))
        })
    }


    /**
     * Send Request with Err Check
     */
    request(verb, query) {
        return new Promise((resolve, reject) => {

            // Avoid rate limit errors if not disabled
            this.queue.throttle()

                // Let Connection send request
                .then(() => this.req(verb, query))

                // Check if Response is error
                .then(res => this.errCheck(res, verb, query))

                // Res is potentially modified (non-err) res from errCheck
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }


    /**
     * Actual Request Code
     */
    req(verb, query) {
        return new Promise((resolve, reject) => {

            if (this.options.use_socket) {
                this.client.emit(verb, query, res => resolve(res))
            }

            // HTTP Request
            else {
                if (typeof query === "string") query = {
                    url: query
                }

                // Request Options
                let req_options = {
                    method: verb,
                    url: this.options.api_url + query.url,
                    body: query.body,
                    json: true
                }

                this.http(req_options, (err, res) => {
                    err ? reject(err) : resolve(res)
                })
            }
        })
    }


    /**
     * Handles Error Responses
     */
    errCheck(res, verb, query) {
        return new Promise((resolve, reject) => {

            // Response not 1xx, 2xx, 3xx?
            if (res.body && parseInt(res.statusCode.toString()[0]) > 3) {

                // If expired: Get new token w/ refresh token & retry method
                if (res.body.toString().includes('jwt expired')) {
                    this.reconnect()

                        // Retry original method
                        .then(() => this.request(verb, query))

                        // Modify response for main
                        .then((res) => resolve(res))
                }

                // Rate Limited
                else if (res.body.toString().includes("Rate limit") && !this.options.ignore_limiter) {

                    // Rejection due to frequency
                    if (res.body.toString().includes('Request intervals too close')) {
                        this.queue.delay(this.queue.delayDiff)
                            .then(() => this.request(verb, query))
                            .then((res) => resolve(res))
                    }

                    // Rejection due to empty token bucket
                    if (res.body.toString().includes('Max requests per interval reached')) {
                        this.queue.delay(this.queue.delayMax)
                            .then(() => this.request(verb, query))
                            .then((res) => resolve(res))
                    }
                }

                // Nodes are busy
                else if (res.body.toString().includes("Please try again")) {

                    // Retry original method
                    this.request(verb, query)

                        // Modify response for main
                        .then((res) => resolve(res))
                }

                // Unhandled error
                else resolve(res)
            }

            // No Error
            else resolve(this.parse(res))
        })
    }


    /**
     * Try to JSON parse the response automatically for convenience
     */
    parse(res) {
        let data

        // Is JSON
        try {
            data = JSON.parse(res.body)
        }

        // Not JSON, keep original value
        catch (e) {
            data = res.body
        }

        return data
    }
}

module.exports = Connection
