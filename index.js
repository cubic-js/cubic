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
            game_name: 'warframe',
            api_version: 'v1',
            use_socket: true,
            user_key: null,
            user_secret: null
        }, options)

        // Establish connection to resource server w/ options
        this.connection = new Connection()
        this.connection.setup(options).then(() => {
            this.emit('ready')
        })

        // Listen to Socket Events and pass outside of module
        if(this.options.use_socket) this.listen()
    }


    /**
     * Sample method to get all stats for specific item
     */
    getItem(query) {

        query = extend({
            name: null,
            component: null,
            timeStart: null,
            timeEnd: null
        }, query)

        return new Promise((resolve, reject) => {
            this.connection.req('GET', {
                resource: this.options.game_name + '/' + this.options.api_version + '/items/' + query.name,
                query: 'statistics',
                params: {
                    component: query.component,
                    timeStart: query.timeStart,
                    timeEnd: query.timeEnd
                }
            }).then((res) => {
                resolve(res.body)
            })
        })
    }

    listen() {

    }
}

module.exports = Nexus
