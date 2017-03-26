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

            /**
             * Set min delay between requests
             */
            if (options.ignore_limiter) {
                this.delay_diff = 0
                this.delay_max = 0
            }

            // With Token provided
            else if (options.user_key && options) {
                this.delay_diff = 300
                this.delay_max = 5000
            }

            // No token
            else {
                this.delay_diff = 550
                this.delay_max = 10000
            }


            /**
             * Set standard value for last request time
             */
            this.delay_last_req = 0 // date for last request
            this.delay_ongoing = 1 // multiplier for delay diff
            this.delay_next_int = 0 // Expected date for next Limiting Interval


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


    /**
     * Get new access token from refresh_token & save in object
     */
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

            // Avoid rate limit errors if not disabled
            this.throttle()

            // Let Connection send request
            .then(() => this.client.send(verb, query))

            // Check if Response is error
            .then(res => this.errCheck(res, verb, query))

            // Res is potentially modified (non-err) res from errCheck
            .then(res => resolve(res))
        })
    }


    /**
     * Makes sure limiter isn't triggered since last request
     */
    throttle() {
        return new Promise((resolve, reject) => {
            let now = new Date().getTime()

            // Set time until next interval
            if (!this.delay_next_int) var next_int = 0
            else var next_int = this.delay_next_int - now

            // Check time between now and next available call
            let diff = now - this.delay_last_req - next_int

            // Set new last request date
            this.delay_last_req = now

            // Calculate delay to wait for
            let delay = this.delay_ongoing * this.delay_diff + next_int


            // Min difference is met
            if (diff > this.delay_diff) resolve()

            // Otherwise, wait for delay difference
            else {

                // Increase delay multiplier
                ++this.delay_ongoing

                // Resolve Promise & sub ongoing
                setTimeout(() => {

                    // Get current expected interval resolution
                    if (!this.delay_next_int) var curr_int = 0
                    else var curr_int = this.delay_next_int - now

                    // Finished while waiting for next interval -> repeat
                    if (curr_int > next_int) {
                        this.throttle().then(() => {
                            --this.delay_ongoing
                            resolve()
                        })
                    }

                    // Finished without waiting for interval
                    else {
                        --this.delay_ongoing // remove current request
                        resolve()
                    }
                }, delay)
            }
        })
    }


    /**
     * Manages Interval delays for rate limiting(coupled with this.throttle())
     */
    delay(delay) {
        this.delay_next_int = new Date().getTime() + delay // expected finished time for other requests to consider

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.delay_next_int = 0 // Reset
                resolve()
            }, delay)
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
                if (res.body.includes('jwt expired')) {
                    this.refreshToken()

                    // Retry original method
                    .then(() => this.request(verb, query))

                    // Modify response for main
                    .then((res) => resolve(res))
                }

                // Rate Limited
                else if (res.body.includes("Rate limit")) {

                    // Rejection due to frequency
                    if (res.body.includes('Request intervals too close')) {
                        this.delay(this.delay_diff)
                            .then(() => this.request(verb, query))
                            .then((res) => resolve(res))
                    }

                    // Rejection due to empty token bucket
                    if (res.body.includes('Max requests per interval reached')) {
                        this.delay(this.delay_max)
                            .then(() => this.request(verb, query))
                            .then((res) => resolve(res))
                    }
                }

                // No action required -> resolve promise, let user handle err
                else {
                    resolve(res)
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
