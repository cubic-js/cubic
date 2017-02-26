const Socket = require('./connections/socket.js')
const Http = require('./connections/http.js')

class Connection {

    /**
     * Set Connection Type
     * In addition to RESTful methods, connection_type 'socket' also allows handling real-time events via this.on(event, procedure)
     */
    constructor(connection_type) {

        // Save connection type
        this.connection_type = connection_type

        // Only allow socket or http as param
        if (connection_type = 'socket') {
            this.client = new Socket()
        } else if (connection_type = 'http') {
            this.client = new Http()
        } else {
            console.warn("nexus-stats-api only accepts 'socket' or 'http' as value for options.connection_type")
        }
    }


    /**
     * Config Headers for request/socket
     */
    config(options){

        // Config Socket
        if(this.connection_type === 'socket'){
            // modify this.client
        }
    }


    /**
     * Return warning if wrong connection type is set
     */
    warnSocket() {
        if (this.connection_type !== 'socket') {
            console.warn("nexus-stats-api cannot listen to events without socket.io stream. Set options.connection_type: 'socket', if you want to use this feature.")
            return false
        }
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
                // Public events
                newRequest: false,

                // Private events (only sent to rooms behind oauth)
                req: true,
                res: true
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
}

module.exports = Connection
