'use strict'

const Socket = require('./connections/socket.js')
const Http = require('./connections/http.js')
const request = require('request')
const Queue = require('./queue.js')
let queue = null

class Connection {

    /**
     * Setup client
     */
    setup(options) {
        return new Promise((resolve, reject) => {

            this.options = options
            queue = new Queue(options)

            /**
             * Get access token if credentials are provided
             */
            if (options.user_key && options.user_secret) {

                // Set authorization token for supplied user data
                this.getToken(options.user_key, options.user_secret)

                // Set headers with received token
                .then(() => this.setHeaders(this.access_token))

                // Apply headers to client
                .then(() => this.setClient(options.use_socket))

                // Resolve Promise
                .then(() => resolve())
            }


            /**
             * Credentials not provided
             */
            else {

                // Set connection target & connect w/ client
                this.auth_options = {
                    namespace: this.options.namespace,
                    api_url: this.options.api_url,
                    auth_url: this.options.auth_url
                }
                this.setClient(options.use_socket)

                // Resolve Promise
                .then(() => resolve())
            }

        })
    }


    /**
     * Get Token on initial call and expiration
     * Always uses http /auth endpoint
     */
    getToken(user_key, user_secret) {
        return new Promise((resolve, reject) => {

            // Set authentication options
            let auth_request = {
                user_key: user_key,
                user_secret: user_secret
            }

            // Post Options
            let post_options = {
                method: 'post',
                body: auth_request,
                json: true
            }

            // Send to /auth endpoint
            request(this.options.auth_url + 'token', post_options, (err, res) => {
                if (err) return err

                // Save token in class object
                this.access_token = res.body.access_token
                this.refresh_token = res.body.refresh_token

                resolve()
            })
        })
    }


    /**
     * Config Headers for request/socket
     * Leave independent param <token>. May be useful for manual action.
     */
    setHeaders(token) {
        if (!token) token = this.access_token

        this.auth_options = {
            token: token,
            namespace: this.options.namespace,
            api_url: this.options.api_url,
            auth_url: this.options.auth_url
        }
    }


    /**
     * Compare connection type, then create new client with previous options
     */
    setClient(use_socket) {
        return new Promise((resolve, reject) => {

            // Use appropriate client (default: socket)
            if (use_socket) {
                Socket.config(this.auth_options, resolve, reject)
                this.client = Socket

                // Refresh token on reconnect
                this.client.socket.on("reconnect", () => {
                    //console.log(this.access_token)
                    this.refreshToken().then(() => {
                        //console.log(this.access_token)
                    })
                })
            } else {
                Http.config(this.auth_options, resolve, reject)
                this.client = Http
            }
        })
    }


    /**
     * Get new access token from refresh_token & save in object
     */
    refreshToken(token) {
        return new Promise((resolve, reject) => {
            if (!token) token = this.refresh_token
            console.log(token)

            // Refresh state for multiple failed requests
            if (!this.refreshing) {
                this.refreshing = true

                // Set authentication options
                let auth_request = {
                    refresh_token: token
                }

                // Post Options
                let post_options = {
                    method: 'post',
                    body: auth_request,
                    json: true
                }

                // Send to /auth endpoint
                request(this.options.auth_url + 'token', post_options, (err, res) => {
                    if (err) reject(err)

                    // Save token in class object
                    this.access_token = res.body.access_token
                    this.setHeaders()
                    this.refreshing = false
                    this.setClient(this.options.use_socket).then(() => resolve())
                })
            }

            // Already refreshing? -> Add to queue
            else resolve()
        })
    }


    /**
     * RESTful methods
     */
    request(verb, query) {
        return new Promise((resolve, reject) => {

            // Avoid rate limit errors if not disabled
            queue.throttle()

            // Let Connection send request
            .then(() => this.client.send(verb, query))

            // Check if Response is error
            .then(res => this.errCheck(res, verb, query))

            // Res is potentially modified (non-err) res from errCheck
            .then(res => resolve(res))
            .catch(err => reject(err))
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
                    this.refreshToken()

                    // Retry original method
                    .then(() => this.request(verb, query))

                    // Modify response for main
                    .then((res) => resolve(res))
                }

                // Rate Limited
                else if (res.body.toString().includes("Rate limit") && !this.options.ignore_limiter) {

                    // Rejection due to frequency
                    if (res.body.toString().includes('Request intervals too close')) {
                        queue.delay(queue.delayDiff)
                            .then(() => this.request(verb, query))
                            .then((res) => resolve(res))
                    }

                    // Rejection due to empty token bucket
                    if (res.body.toString().includes('Max requests per interval reached')) {
                        queue.delay(queue.delayMax)
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
            else resolve(res)
        })
    }
}

module.exports = Connection
