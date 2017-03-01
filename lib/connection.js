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

            // Set authorization token for supplied user data
            this.setToken(options.user_key, options.user_secret)

            // Set headers with received token
                .then(() => {
                this.setHeaders(this.token)
            })

            // Apply headers to client
                .then(() => {
                this.setClient(options.use_socket)
            })

                .then(() => {
                resolve()
            })
        })
    }


    /**
     * Get Token on initial call and expiration
     * Always uses http /auth endpoint
     */
    setToken(user_key, user_secret) {
        return new Promise((resolve, reject) => {

            // Set authentication options
            var auth_request = {
                user_key: user_key,
                user_secret: user_secret
            }

            // Post Options
            var post_options = {
                method: 'post',
                body: auth_request,
                json: true,
                url: 'http://localhost:3400/auth'
            }

            // Send to /auth endpoint
            request('http://localhost:3400/auth', post_options, (err, res) => {
                if (err) return err

                // Save token in class object
                this.token = res.body.token
                resolve()
            })
        })
    }


    /**
     * Config Headers for request/socket
     * Leave independent param <token>. May be useful for manual action.
     */
    setHeaders(token) {
        this.auth_options = {
            headers: {
                'user-agent': 'nexus-adapter-node/0.0.1',
                Authorization: 'JWT ' + token
            }
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
    get(query, resolve, reject) {
        this.client.send('GET', query, resolve, reject)
    }

    post(query, resolve, reject) {
        this.client.send('POST', query, resolve, reject)
    }

    put(query, resolve, reject) {
        this.client.send('PUT', query, resolve, reject)
    }

    delete(query, resolve, reject) {
        this.client.send('DELETE', query, resolve, reject)
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
