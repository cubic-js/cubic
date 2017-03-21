const Socket = require('./connections/socket.js')
const Http = require('./connections/http.js')
const request = require('request')

class Connection {

    /**
     * Set Connection Type
     * In addition to RESTful methods, connection_type 'socket' also allows handling real-time events via this.on(event, procedure)
     */
    constructor() {}

    setup(options) {
        return new Promise((resolve, reject) => {

            this.options = options

            if (options.user_key && options.user_secret) {

                // Set authorization token for supplied user data
                this.getToken(options.user_key, options.user_secret)

                // Set headers with received token
                .then(() => this.setHeaders(this.access_token))

                // Apply headers to client
                .then(() => this.setClient(options.use_socket))

                // Resolve Promise
                .then(() => resolve())

            } else {
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
            request('http://localhost:7119/auth', post_options, (err, res) => {
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
            token: token
        }
    }


    /**
     * Compare connection type, then create new client with previous options
     */
    setClient(use_socket) {
        return new Promise((resolve, reject) => {

            // Use appropriate client (default: socket)
            if (use_socket) {
                this.client = new Socket(this.auth_options, resolve, reject)
            } else {
                this.client = new Http(this.auth_options, resolve, reject)
            }
        })
    }

    refreshToken(token) {
        return new Promise((resolve, reject) => {
            if (!token) token = this.refresh_token

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
            request('http://localhost:7119/auth', post_options, (err, res) => {
                if (err) reject(err)

                // Save token in class object
                this.access_token = res.body.access_token
                this.setHeaders()
                this.setClient(this.options.use_socket).then(() => resolve())
            })
        })
    }


    /**
     * Subscribe to socket events
     */
    subscribe(options) {
        this.warnSocket()

        /**
         * Set options given by client.
         */
        this.events = extend({
            resource: '/',
            events: {
                newRequest: false,
            }
        }, options)


        /**
         * Connect to socket.io room describing a resource
         */
        connection.emit('join', options.resource)
    }


    /**
     * Let Socket client listen to incoming events
     * Events MUST be subscribed to before
     */
    on(event, procedure) {
        this.warnSocket()
    }


    /**
     * RESTful methods
     */
    request(verb, query) {
        return new Promise((resolve, reject) => {

            this.client.send(verb, query)

            // Check if Response is error
            .then(res => this.errCheck(res, verb, query))

            // Res is potentially modified (non-err) res from errCheck
            .then(res => resolve(res))
        })
    }


    /**
     * Handles Error Responses
     */
    errCheck(res, verb, query) {
        return new Promise((resolve, reject) => {

            // Response contains error?
            if (res.statusCode !== 200) {

                // If expired: Get new token w/ refresh token & retry method
                if (res.body === 'TokenExpiredError') {
                    this.refreshToken()

                    // Retry original method
                    .then(() => this.request(verb, query))

                    // Modify response for main
                    .then((res) => resolve(res))
                }

                // No action required -> reject promise
                else {
                    reject(res)
                }
            }

            // No Error
            else {
                resolve(res)
            }
        })
    }



    /**
     * Return warning if wrong connection type is set
     */
    warnSocket() {
        if (!this.client instanceof Socket) {
            console.warn("nexus-stats-api cannot listen to events without socket.io stream. Set options.connection_type: 'socket', if you want to use this feature.")
            return false
        }
    }
}

module.exports = Connection
