const io = require('socket.io-client')
const request = require('request-promise')
const Queue = require('./queue.js')
const Auth = require("./auth.js")
const timeout = (fn, s) => {
    return new Promise(resolve => setTimeout(() => resolve(fn()), s))
}

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
            this.reload()
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
    async connect() {
        await this.auth.authorize().then(() => this.setClient())
    }


    reload() {
        if (!this.reconnecting) {
            this.reconnecting = this.reconnect()
        }
        return this.reconnecting
    }


    /**
     * Close existing connection and start new with available tokens
     */
    async reconnect() {
        await this.auth.reauthorize()
        this.client.disconnect()
        this.client.io.opts.query = this.auth.access_token ? 'bearer=' + this.auth.access_token : null
        this.client.connect()

        // Modify http requests for new token
        let httpConfig = this.auth.access_token ? {
            headers: {
                authorization: "bearer " + this.auth.access_token
            }
        } : {}

        this.http = request.defaults(httpConfig)
        this.client.once("connect", () => {
            this.reconnecting = null
        })

        // Retry if server unreachable
        await timeout(() => this.client.connected ? null : this.reload(), 1000)
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
    async request(verb, query) {
        await this.queue.throttle()
        let res = await this.req(verb, query)
        return this.errCheck(res, verb, query)
    }


    /**
     * Actual Request Code
     */
    async req(verb, query) {

        if (this.options.use_socket) {
            return new Promise(resolve =>  this.client.emit(verb, query, resolve))
        }

        // HTTP Request
        else {
            if (typeof query === "string") query = {
                url: query
            }
            let req_options = {
                method: verb,
                url: this.options.api_url + query.url,
                body: query.body,
                json: true
            }
            return this.http(req_options)
        }
    }


    /**
     * Handles Error Responses
     */
    async errCheck(res, verb, query) {

        // Response not 1xx, 2xx, 3xx?
        if (res.body && parseInt(res.statusCode.toString()[0]) > 3) {

            // If expired: Get new token w/ refresh token & retry method
            if (res.body.toString().includes('jwt expired')) {
                await this.reload()
                return this.request(verb, query)
            }

            // Rate Limited
            else if (res.body.toString().includes("Rate limit") && !this.options.ignore_limiter) {

                // Rejection due to frequency
                if (res.body.toString().includes('Request intervals too close')) {
                    await this.queue.delay(this.queue.delayDiff)
                    return this.request(verb, query)
                }

                // Rejection due to empty token bucket
                if (res.body.toString().includes('Max requests per interval reached')) {
                    await this.queue.delay(this.queue.delayMax)
                    return this.request(verb, query)
                }
            }

            // Nodes are busy -> retry
            else if (res.body.toString().includes("Please try again")) {
                return this.request(verb, query)
            }

            // Unhandled error
            else {
                return res
            }
        }

        // No Error
        else {
            return this.parse(res)
        }
    }


    /**
     * Try to JSON parse the response automatically for convenience
     */
    parse(res) {
        // Is JSON
        try {
            return JSON.parse(res.body)
        }
        // Not JSON, keep original value
        catch (e) {
            return res.body
        }
    }
}

module.exports = Connection
