/**
 * Listen to API socket server
 */
const extend = require('deep-extend')
const Connection = require('./lib/connection.js')

class Nexus {

    /**
     * Merge default options with client options
     */
    constructor(options) {

        this.options = extend({
            game_name: 'warframe',
            user_key: null,
            user_secret: null,
            connection_type: 'socket',
        }, options)

        this.connection = new Connection(this.options.connection_type)

        this.connection.config(this.options)
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
            this.connection.get({
                resource: 'items/' + query.name,
                query: 'statistics',
                params: {
                    component: query.component,
                    timeStart: query.timeStart,
                    timeEnd: query.timeEnd
                }
            }, resolve, reject)
        })
    }
}

module.exports = Nexus
